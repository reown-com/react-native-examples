import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { btoa } from 'react-native-quick-base64';

import { useTheme } from '@/hooks/useTheme';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { Spacing } from '@/utils/ThemeUtil';
import LogStore from '@/store/LogStore';

function getBaseUrl(urlString: string): string {
  try {
    const urlObj = new URL(urlString);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return urlString;
  }
}

// This is the data that will be prefilled in the webview
const PREFILL_DATA = {
  fullName: 'John Doe',
  dob: '1990-06-15',
};

function buildUrlWithPrefill(baseUrl: string): string {
  const prefillJson = JSON.stringify(PREFILL_DATA);
  const prefillBase64 = btoa(prefillJson);

  if (baseUrl.includes('prefill=')) {
    return baseUrl.replace(/prefill=([^&]*)/, `prefill=${prefillBase64}`);
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}prefill=${prefillBase64}`;
}

interface CollectDataWebViewProps {
  url: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function CollectDataWebView({
  url,
  onComplete,
  onError,
}: CollectDataWebViewProps) {
  const Theme = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const finalUrl = useMemo(() => {
    const urlWithPrefill = buildUrlWithPrefill(url);
    LogStore.log('WebView URL with prefill', 'CollectDataWebView', 'finalUrl', {
      originalUrl: url,
      finalUrl: urlWithPrefill,
    });
    return urlWithPrefill;
  }, [url]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      LogStore.log('WebView unmounted', 'CollectDataWebView', 'cleanup');
    };
  }, []);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (!isMountedRef.current) return;

      LogStore.log(
        'WebView navigation',
        'CollectDataWebView',
        'handleNavigationStateChange',
        { url: navState.url },
      );
    },
    [],
  );

  const handleError = useCallback(
    (syntheticEvent: { nativeEvent: { description: string } }) => {
      if (!isMountedRef.current) return;

      const { description } = syntheticEvent.nativeEvent;
      LogStore.error('WebView error', 'CollectDataWebView', 'handleError', {
        error: description,
      });
      onError(description || 'Failed to load the form');
    },
    [onError],
  );

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      if (!isMountedRef.current) return;

      try {
        const message = JSON.parse(event.nativeEvent.data) as {
          type: 'IC_COMPLETE' | 'IC_ERROR';
          success: boolean;
          error?: string;
        };
        LogStore.log(
          'WebView message received',
          'CollectDataWebView',
          'handleMessage',
          { message },
        );

        if (message.type === 'IC_COMPLETE' && message.success) {
          onComplete();
        } else if (message.type === 'IC_ERROR' || !message.success) {
          onError(message.error || 'Form submission failed');
        }
      } catch {
        LogStore.log(
          'WebView message (non-JSON)',
          'CollectDataWebView',
          'handleMessage',
          { data: event.nativeEvent.data },
        );
      }
    },
    [onComplete, onError],
  );

  const baseUrl = useMemo(() => getBaseUrl(url), [url]);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      LogStore.log(
        'WebView load request',
        'CollectDataWebView',
        'handleShouldStartLoadWithRequest',
        { url: request.url },
      );

      // Allow about:blank URL to load in WebView
      if (request.url.startsWith('about:blank')) {
        return true;
      }

      const requestBaseUrl = getBaseUrl(request.url);

      if (requestBaseUrl !== baseUrl) {
        LogStore.log(
          'Opening external link in browser',
          'CollectDataWebView',
          'handleShouldStartLoadWithRequest',
          { url: request.url },
        );
        Linking.openURL(request.url);
        return false;
      }

      return true;
    },
    [baseUrl],
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: Theme['bg-primary'] },
          ]}
        >
          <WalletConnectLoading size={120} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: finalUrl }}
        originWhitelist={[
          'https://dev.pay.walletconnect.com',
          'https://staging.pay.walletconnect.com',
          'https://pay.walletconnect.com',
        ]}
        style={[styles.webView, { backgroundColor: Theme['bg-primary'] }]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scalesPageToFit
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: Spacing[4],
  },
});
