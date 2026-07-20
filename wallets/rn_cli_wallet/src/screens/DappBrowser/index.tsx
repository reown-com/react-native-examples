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
