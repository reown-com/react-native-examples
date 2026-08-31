import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { useTheme } from '@/hooks/useTheme';
import { walletKit } from '@/utils/WalletKitUtil';
import { registerPickerPairing } from '@/utils/PickerUtil';
import { RootStackScreenProps } from '@/utils/TypesUtil';

type Props = RootStackScreenProps<'DappBrowser'>;

/**
 * H2b bridge wrapper, injected at document start on every page load (per the
 * technical design, "How wallets expose the bridge"). It gives the dapp:
 * - autoConnect: the wallet-originated launch signal. Always true here
 *   because this webview only hosts Explore launches; a generic in-wallet
 *   browser must NOT set it. User consent still gates auto-approval on the
 *   wallet side (SettingsStore.pickerAutoConnect) — without it the dapp still
 *   connects, but through the normal proposal modal.
 * - postMessage: one wallet-agnostic channel the dapp uses to hand back the
 *   pairing URI as {type:'wc_session_offer', uri}.
 * The flag is a trigger, not proof of origin: pairing topics are recorded and
 * only picker-initiated proposals are auto-approved (PickerUtil).
 */
const WALLET_CONNECT_HOST_BRIDGE = `
  window.walletConnectHost = {
    autoConnect: true,
    postMessage: function (message) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  };
  true;
`;

/**
 * Dapp Picker POC (H2b): webview host for Explore-launched dapps. The dapp
 * posts {type:'wc_session_offer', uri} via window.ReactNativeWebView; we pair
 * silently and the proposal is auto-approved (see useWalletKitEventsManager).
 * A wc: navigation intercept covers hosts/pages where postMessage fails.
 */
export default function DappBrowser({ route }: Props) {
  const Theme = useTheme();
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const pairedUris = useRef(new Set<string>());

  const pairFromDapp = useCallback(async (uri: string) => {
    if (!uri.startsWith('wc:') || pairedUris.current.has(uri)) {
      return;
    }
    pairedUris.current.add(uri);
    // Mark this pairing as picker-initiated BEFORE pairing so the proposal
    // handler can recognize it.
    registerPickerPairing(uri);
    try {
      await SettingsStore.state.initPromise;
      await walletKit.pair({ uri });
    } catch (e) {
      LogStore.error((e as Error).message, 'DappBrowser', 'pair');
    }
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        if (message?.type === 'wc_session_offer' && message.uri) {
          LogStore.info('wc_session_offer received', 'DappBrowser', 'onMessage');
          pairFromDapp(message.uri);
        }
      } catch {
        // Non-JSON messages from the page are ignored.
      }
    },
    [pairFromDapp],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      // Fallback URI handoff: the dapp navigates to wc:… when the
      // postMessage bridge is unavailable.
      if (request.url.startsWith('wc:')) {
        pairFromDapp(request.url);
        return false;
      }
      return true;
    },
    [pairFromDapp],
  );

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <WebView
        source={{ uri: url }}
        injectedJavaScriptBeforeContentLoaded={WALLET_CONNECT_HOST_BRIDGE}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
      {isLoading && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color={Theme['text-accent-primary']} />
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
    ...StyleSheet.absoluteFill as object,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
