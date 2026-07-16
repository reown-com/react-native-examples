import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Linking, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {RootStackScreenProps} from '@/utils/TypesUtil';
import {ToastUtils} from '@/utils/ToastUtils';
import OmenStore from '@/stores/OmenStore';
import {PaySuccessView} from '@/screens/PayWebView/PaySuccessView';

import {useWebViewDebugLog} from './useWebViewDebugLog';
import WebViewDebugOverlay from './WebViewDebugOverlay';
import {OMEN_COLORS} from './theme';

// On-screen debug overlay for the deposit WebView. We have no JS console on-device, so this
// surfaces the navigation / handoff / forwarded BX-console trail. Flip to false to strip it.
const DEBUG = true;

// The BX /deposit page posts these over the RN WebView bridge (window.ReactNativeWebView) — see
// buyer-experience src/lib/webview-bridge.ts. This is the deposit contract, distinct from the
// PAY_SUCCESS/PAY_FAILURE contract PayWebView handles, so this screen owns its own onMessage.
type DepositMessage = {
  type?: 'DEPOSIT_COMPLETE' | 'DEPOSIT_CANCELLED';
  source?: 'wallet' | 'exchange' | 'direct';
  txHash?: string;
  amount?: number;
};

// A debug line forwarded from inside the BX page by the injected console/error hook below. Marked
// with `__omenDebug` so it stays disjoint from the DEPOSIT_* deposit contract.
type DebugMessage = {
  __omenDebug: true;
  level: 'console' | 'error' | 'open';
  text: string;
};

// Injected into the BX page BEFORE its content loads: mirror console.*, window errors, unhandled
// rejections, and window.open() back over the bridge so they land in the on-screen debug overlay.
const DEBUG_FORWARDER = `
(function () {
  if (window.__omenDebugInstalled) return;
  window.__omenDebugInstalled = true;
  function post(level, text) {
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ __omenDebug: true, level: level, text: String(text).slice(0, 2000) })
      );
    } catch (e) {}
  }
  function fmt(args) {
    return Array.prototype.map
      .call(args, function (a) {
        try {
          if (a instanceof Error) return a.name + ': ' + a.message;
          if (typeof a === 'object') return JSON.stringify(a);
          return String(a);
        } catch (e) {
          return String(a);
        }
      })
      .join(' ');
  }
  ['log', 'info', 'warn', 'error'].forEach(function (k) {
    var orig = console[k] ? console[k].bind(console) : function () {};
    console[k] = function () {
      post(k === 'error' ? 'error' : 'console', k.toUpperCase() + ': ' + fmt(arguments));
      orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function (e) {
    post('error', 'window.onerror: ' + (e.message || '') + (e.filename ? ' @ ' + e.filename + ':' + e.lineno : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    post('error', 'unhandledrejection: ' + (r && r.message ? r.message : JSON.stringify(r)));
  });
  var _open = window.open;
  window.open = function (u, n, f) {
    post('open', 'window.open(' + u + ')');
    try {
      return _open ? _open.call(window, u, n, f) : null;
    } catch (err) {
      post('error', 'window.open threw: ' + err);
      return null;
    }
  };
  post('console', 'debug forwarder installed @ ' + location.href);
})();
true;
`;

// A wallet-connect deeplink carries the WC pairing URI in its `uri` query param. Kept local
// (mirrors PayWebView) so the merged PayWebView stays untouched.
function isWalletDeeplink(url: string): boolean {
  try {
    const wcUri = new URL(url).searchParams.get('uri');
    return !!wcUri && wcUri.startsWith('wc:');
  } catch {
    return false;
  }
}

function formatUsd(n: number): string {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/, ',')}`;
}

function OmenDepositWebView({route, navigation}: RootStackScreenProps<'OmenDepositWebView'>) {
  const {url} = route.params;
  const debug = useWebViewDebugLog();
  const log = debug.log;

  // Once the deposit page reports completion we swap the WebView for the success result screen
  // (reuses PayWebView's Lottie checkmark view).
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Dark loading cover over the WebView until the page paints — kills the white flash on open.
  const [isPageLoading, setIsPageLoading] = useState(true);

  const openWallet = useCallback(
    async (target: string) => {
      log('open', 'openWallet →', target);
      try {
        const can = await Linking.canOpenURL(target);
        log('open', `canOpenURL = ${can}`);
      } catch (err) {
        log('error', 'canOpenURL threw', String(err));
      }
      Linking.openURL(target)
        .then(() => log('open', 'openURL resolved'))
        .catch(err => {
          log('error', 'openURL rejected', String(err));
          ToastUtils.showErrorToast(
            "Couldn't open wallet",
            'The wallet app may not be installed.',
          );
        });
    },
    [log],
  );

  // In-frame navigations to a wallet deeplink are handed to the OS (opens the wallet); everything
  // else loads in the WebView.
  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      const wallet = isWalletDeeplink(request.url);
      log('nav', `shouldStart (wallet=${wallet}) →`, request.url);
      if (wallet) {
        openWallet(request.url);
        return false;
      }
      return true;
    },
    [log, openWallet],
  );

  // window.open() targets route here instead. Only hand wallet deeplinks off to the OS so a page
  // can't drive Linking.openURL to arbitrary native schemes (tel:/sms:/intent:...).
  const onOpenWindow = useCallback(
    (event: WebViewOpenWindowEvent) => {
      const {targetUrl} = event.nativeEvent;
      const wallet = isWalletDeeplink(targetUrl);
      log('open', `openWindow (wallet=${wallet}) →`, targetUrl);
      if (wallet) {
        openWallet(targetUrl);
      }
    },
    [log, openWallet],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const raw = event.nativeEvent.data;

      let parsed: DepositMessage | DebugMessage;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Non-JSON message — ignore.
        return;
      }

      // Forwarded BX console/error line → overlay only, never the deposit contract.
      if ((parsed as DebugMessage).__omenDebug) {
        const d = parsed as DebugMessage;
        log(d.level, d.text);
        return;
      }

      const message = parsed as DepositMessage;
      log('msg', `onMessage ${message.type ?? '(no type)'}`, raw.slice(0, 500));

      if (message.type === 'DEPOSIT_COMPLETE') {
        const credited = OmenStore.credit({
          amount: message.amount,
          source: message.source,
          txHash: message.txHash,
        });
        setSuccessMessage(`${formatUsd(credited)} added to your account`);
      } else if (message.type === 'DEPOSIT_CANCELLED') {
        navigation.goBack();
      }
    },
    [log, navigation],
  );

  const onError = useCallback(
    (event: WebViewErrorEvent) => {
      const {code, description, url: failedUrl} = event.nativeEvent;
      log('error', `onError ${code}`, `${description} @ ${failedUrl}`);
      ToastUtils.showErrorToast(
        'Failed to load deposit page',
        'Check your connection and try again.',
      );
      navigation.goBack();
    },
    [log, navigation],
  );

  const onHttpError = useCallback(
    (event: WebViewHttpErrorEvent) => {
      const {statusCode, description, url: failedUrl} = event.nativeEvent;
      log('error', `onHttpError ${statusCode}`, `${description ?? ''} @ ${failedUrl}`);
    },
    [log],
  );

  if (successMessage !== null) {
    return (
      <PaySuccessView
        message={successMessage || undefined}
        onDone={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        source={{uri: url}}
        style={styles.webview}
        // Match the Omen host bg while the page loads so there's no white flash.
        containerStyle={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows
        injectedJavaScriptBeforeContentLoaded={DEBUG ? DEBUG_FORWARDER : undefined}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onOpenWindow={onOpenWindow}
        onMessage={onMessage}
        onError={onError}
        onHttpError={onHttpError}
        onLoadEnd={() => setIsPageLoading(false)}
      />
      {isPageLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={OMEN_COLORS.accent} />
        </View>
      ) : null}
      {DEBUG ? <WebViewDebugOverlay entries={debug.entries} onClear={debug.clear} /> : null}
    </SafeAreaView>
  );
}

export default OmenDepositWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OMEN_COLORS.bg,
  },
  webview: {
    flex: 1,
    backgroundColor: OMEN_COLORS.bg,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OMEN_COLORS.bg,
  },
});
