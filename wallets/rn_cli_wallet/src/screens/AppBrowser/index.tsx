import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { useTheme } from '@/hooks/useTheme';
import { walletKit } from '@/utils/WalletKitUtil';
import {
  getOrigin,
  isSameOrigin,
  registerExplorePairing,
} from '@/utils/ExploreUtil';
import { RootStackScreenProps } from '@/utils/TypesUtil';

type Props = RootStackScreenProps<'AppBrowser'>;

/**
 * H2b bridge, injected at document start on every page load (per the
 * technical design, "How wallets expose the bridge"). It gives the app:
 * - autoConnect: the wallet-originated launch signal. This screen only hosts
 *   Explore launches; a generic in-wallet browser must NOT set it. The flag
 *   is only set on the tile's origin, so a page the user navigates to on
 *   another site keeps its normal connect flow.
 * - postMessage: the channel the app uses to hand back the pairing URI as
 *   {type:'wc_session_offer', uri}.
 * The flag is a trigger, not proof of origin: onMessage re-checks the
 * origin natively and only recorded pairing topics are auto-approved
 * (ExploreUtil).
 */
function buildBridgeScript(origin: string) {
  return `
  if (window.location.origin === ${JSON.stringify(origin)}) {
    window.walletConnectHost = {
      autoConnect: true,
      postMessage: function (message) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    };
  }
  true;
`;
}

/**
 * Explore (H2b): webview host for Explore-launched apps. A same-origin
 * {type:'wc_session_offer', uri} is paired silently and the proposal is
 * auto-approved (see useWalletKitEventsManager). A wc: navigation is paired
 * too, but goes through the normal proposal modal.
 */
export default function AppBrowser({ route }: Props) {
  const Theme = useTheme();
  const { url } = route.params;
  const tileOrigin = useMemo(() => getOrigin(url), [url]);
  const [isLoading, setIsLoading] = useState(true);
  const pairedUris = useRef(new Set<string>());

  const pair = useCallback(async (uri: string) => {
    if (!uri.startsWith('wc:') || pairedUris.current.has(uri)) {
      return;
    }
    pairedUris.current.add(uri);
    try {
      await SettingsStore.state.initPromise;
      await walletKit.pair({ uri });
    } catch (e) {
      LogStore.error((e as Error).message, 'AppBrowser', 'pair');
    }
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message;
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch {
        // Non-JSON messages from the page are ignored.
        return;
      }
      if (message?.type !== 'wc_session_offer' || !message.uri) {
        return;
      }
      // Only the tile's own origin may offer a session to auto-approve.
      const pageUrl = event.nativeEvent.url;
      if (!tileOrigin || !isSameOrigin(pageUrl, tileOrigin)) {
        LogStore.warn(
          'wc_session_offer ignored: page origin differs from tile',
          'AppBrowser',
          'onMessage',
          { pageOrigin: getOrigin(pageUrl) ?? pageUrl, tileOrigin },
        );
        return;
      }
      LogStore.info('wc_session_offer received', 'AppBrowser', 'onMessage');
      // Record the topic BEFORE pairing so the proposal handler recognizes it.
      registerExplorePairing(message.uri);
      pair(message.uri);
    },
    [pair, tileOrigin],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      // A wc: navigation (e.g. the app's own "open wallet" link) carries no
      // origin we can verify, so it pairs through the normal modal.
      if (request.url.startsWith('wc:')) {
        pair(request.url);
        return false;
      }
      return true;
    },
    [pair],
  );

  const bridgeScript = useMemo(
    () => (tileOrigin ? buildBridgeScript(tileOrigin) : undefined),
    [tileOrigin],
  );

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <WebView
        source={{ uri: url }}
        injectedJavaScriptBeforeContentLoaded={bridgeScript}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
      {isLoading && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator
            size="large"
            color={Theme['text-accent-primary']}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
