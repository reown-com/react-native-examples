import React, {useCallback, useState} from 'react';
import {Linking, StyleSheet} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';

import {RootStackScreenProps} from '@/utils/TypesUtil';
import {ToastUtils} from '@/utils/ToastUtils';
import OmenStore from '@/stores/OmenStore';
import {PaySuccessView} from '@/screens/PayWebView/PaySuccessView';

// The BX /deposit page posts these over the RN WebView bridge (window.ReactNativeWebView) — see
// buyer-experience src/lib/webview-bridge.ts. This is the deposit contract, distinct from the
// PAY_SUCCESS/PAY_FAILURE contract PayWebView handles, so this screen owns its own onMessage.
type DepositMessage = {
  type?: 'DEPOSIT_COMPLETE' | 'DEPOSIT_CANCELLED';
  source?: 'wallet' | 'exchange' | 'direct';
  txHash?: string;
  amount?: number;
};

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

  // Once the deposit page reports completion we swap the WebView for the success result screen
  // (reuses PayWebView's Lottie checkmark view).
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openWallet = useCallback((target: string) => {
    Linking.openURL(target).catch(() => {
      ToastUtils.showErrorToast("Couldn't open wallet", 'The wallet app may not be installed.');
    });
  }, []);

  // In-frame navigations to a wallet deeplink are handed to the OS (opens the wallet); everything
  // else loads in the WebView.
  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      if (isWalletDeeplink(request.url)) {
        openWallet(request.url);
        return false;
      }
      return true;
    },
    [openWallet],
  );

  // window.open() targets route here instead. Only hand wallet deeplinks off to the OS so a page
  // can't drive Linking.openURL to arbitrary native schemes (tel:/sms:/intent:...).
  const onOpenWindow = useCallback(
    (event: WebViewOpenWindowEvent) => {
      const {targetUrl} = event.nativeEvent;
      if (isWalletDeeplink(targetUrl)) {
        openWallet(targetUrl);
      }
    },
    [openWallet],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: DepositMessage;
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch {
        // Non-JSON message — ignore.
        return;
      }

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
    [navigation],
  );

  const onLoadError = useCallback(() => {
    ToastUtils.showErrorToast(
      'Failed to load deposit page',
      'Check your connection and try again.',
    );
    navigation.goBack();
  }, [navigation]);

  if (successMessage !== null) {
    return (
      <PaySuccessView
        message={successMessage || undefined}
        onDone={() => navigation.goBack()}
      />
    );
  }

  return (
    <WebView
      source={{uri: url}}
      style={styles.webview}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onOpenWindow={onOpenWindow}
      onMessage={onMessage}
      onError={onLoadError}
    />
  );
}

export default OmenDepositWebView;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
