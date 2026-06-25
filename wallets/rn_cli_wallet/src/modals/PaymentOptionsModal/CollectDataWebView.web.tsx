// Web variant of CollectDataWebView. react-native-webview is native-only, so on
// web we embed the identity-collection (IC / KYC) form in an <iframe>
// (react-native-web renders to the DOM, so a raw iframe element works here).
//
// Native uses WebView.onMessage (window.ReactNativeWebView.postMessage); on web
// the page reports completion via window.postMessage to the parent, which we
// receive through a 'message' event listener. The payload shape is the same:
//   { type: 'IC_COMPLETE' | 'IC_ERROR', success: boolean, error?: string }
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';

import { useTheme } from '@/hooks/useTheme';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';

function getBaseUrl(urlString: string): string {
  try {
    const urlObj = new URL(urlString);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return urlString;
  }
}

// This is the data that will be prefilled in the form
const PREFILL_DATA = {
  fullName: 'John Doe',
  dob: '1990-06-15',
  pobAddress: 'Buenos Aires',
};

function buildUrlWithPrefill(
  baseUrl: string,
  themeMode: 'light' | 'dark',
): string {
  const prefillBase64 = globalThis.btoa(JSON.stringify(PREFILL_DATA));

  let result = baseUrl;
  if (result.includes('prefill=')) {
    result = result.replace(/prefill=([^&]*)/, `prefill=${prefillBase64}`);
  } else {
    const separator = result.includes('?') ? '&' : '?';
    result = `${result}${separator}prefill=${prefillBase64}`;
  }

  result += `&theme=${themeMode === 'dark' ? 'dark' : 'light'}`;
  return result;
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
  const { themeMode } = useSnapshot(SettingsStore.state);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const finalUrl = useMemo(
    () => buildUrlWithPrefill(url, themeMode),
    [url, themeMode],
  );
  const allowedOrigin = useMemo(() => getBaseUrl(url), [url]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!isMountedRef.current) {
        return;
      }
      // Only trust messages from the IC form's origin.
      if (event.origin !== allowedOrigin) {
        return;
      }

      try {
        const message = (
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        ) as { type?: string; success?: boolean; error?: string };

        LogStore.log(
          'iframe message received',
          'CollectDataWebView.web',
          'handleMessage',
          { message },
        );

        if (message.type === 'IC_COMPLETE' && message.success) {
          onComplete();
        } else if (message.type === 'IC_ERROR' || message.success === false) {
          onError(message.error || 'Form submission failed');
        }
      } catch {
        // Ignore non-JSON / unrelated messages.
      }
    },
    [allowedOrigin, onComplete, onError],
  );

  useEffect(() => {
    isMountedRef.current = true;
    // The RN TS lib doesn't type globalThis with DOM events; cast for the listener.
    const target = globalThis as unknown as {
      addEventListener: (t: string, cb: (e: MessageEvent) => void) => void;
      removeEventListener: (t: string, cb: (e: MessageEvent) => void) => void;
    };
    target.addEventListener('message', handleMessage);
    return () => {
      isMountedRef.current = false;
      target.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: Theme['bg-primary'] },
          ]}>
          <WalletConnectLoading size={120} />
        </View>
      )}
      <iframe
        title="Identity collection form"
        src={finalUrl}
        onLoad={() => setIsLoading(false)}
        allow="camera; clipboard-write"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          backgroundColor: Theme['bg-primary'],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
