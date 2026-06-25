// Web variant of CollectDataWebView.
//
// The identity-collection (IC / KYC) form at pay.walletconnect.com sends
// `X-Frame-Options: DENY`, so it CANNOT be embedded in an <iframe> on web.
// Instead we open it in a new tab/window (a top-level context, which the form
// allows) and pass a `callbackUrl` query param. On completion the form
// redirects the popup to:
//   {callbackUrl}?status=success&paymentId=...           (success)
//   {callbackUrl}?status=error&code=...&message=...       (error)
//
// We set callbackUrl to our own web origin + a marker (?pay_ic_callback=1).
// index.web.js detects that marker in the popup, relays the result to
// window.opener via postMessage, and closes the popup. Here (the opener / wallet
// tab) we listen for that message and call onComplete / onError.
//
// NOTE: the form requires callbackUrl to be HTTPS (or a custom deeplink scheme)
// — plain http://localhost is rejected, so the return leg only works when the
// web app is served over HTTPS (production, a tunnel, or `--https`).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';

import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Spacing } from '@/utils/ThemeUtil';
import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';

// Marker query param identifying the IC callback popup (see index.web.js).
export const PAY_IC_CALLBACK_PARAM = 'pay_ic_callback';

// The RN TS lib doesn't type globalThis with DOM APIs; narrow to what we use.
type PopupWindow = { close: () => void } | null;
const webGlobal = globalThis as unknown as {
  location?: { origin: string };
  open: (url: string, target?: string, features?: string) => PopupWindow;
};

const PREFILL_DATA = {
  fullName: 'John Doe',
  dob: '1990-06-15',
  pobAddress: 'Buenos Aires',
};

function buildCollectUrl(
  baseUrl: string,
  themeMode: 'light' | 'dark',
  callbackUrl: string,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('prefill', globalThis.btoa(JSON.stringify(PREFILL_DATA)));
  url.searchParams.set('theme', themeMode === 'dark' ? 'dark' : 'light');
  url.searchParams.set('callbackUrl', callbackUrl);
  return url.toString();
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
  const popupRef = useRef<PopupWindow>(null);
  const [opened, setOpened] = useState(false);

  const collectUrl = useMemo(() => {
    const origin = webGlobal.location?.origin ?? '';
    const callbackUrl = `${origin}/?${PAY_IC_CALLBACK_PARAM}=1`;
    return buildCollectUrl(url, themeMode, callbackUrl);
  }, [url, themeMode]);

  const openForm = useCallback(() => {
    // Must run from a user gesture or the browser blocks the popup.
    const popup = webGlobal.open(collectUrl, '_blank', 'noopener=no,popup=yes');
    if (!popup) {
      onError('Pop-up blocked. Allow pop-ups for this site, then try again.');
      return;
    }
    popupRef.current = popup;
    setOpened(true);
  }, [collectUrl, onError]);

  useEffect(() => {
    const target = globalThis as unknown as {
      addEventListener: (t: string, cb: (e: MessageEvent) => void) => void;
      removeEventListener: (t: string, cb: (e: MessageEvent) => void) => void;
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== webGlobal.location?.origin) {
        return;
      }
      const data = event.data as {
        source?: string;
        status?: string;
        code?: string;
        message?: string;
      };
      if (data?.source !== 'pay-ic-callback') {
        return;
      }

      LogStore.log('IC callback received', 'CollectDataWebView.web', 'message', {
        status: data.status,
        code: data.code,
      });
      popupRef.current?.close();

      if (data.status === 'success') {
        onComplete();
      } else {
        onError(data.message || data.code || 'Form submission failed');
      }
    };

    target.addEventListener('message', handleMessage);
    return () => target.removeEventListener('message', handleMessage);
  }, [onComplete, onError]);

  return (
    <View
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <Text variant="lg-500" color="text-primary" style={styles.title}>
        Identity verification
      </Text>
      <Text variant="sm-400" color="text-secondary" style={styles.subtitle}>
        {opened
          ? 'Complete the form in the new window. This screen updates automatically when you finish.'
          : 'A new window will open to collect a few details. Pop-ups must be allowed.'}
      </Text>
      <Button
        testID="pay-ic-open-form"
        onPress={openForm}
        style={[styles.button, { backgroundColor: Theme['bg-accent-primary'] }]}>
        <Text variant="md-500" color="text-invert">
          {opened ? 'Reopen verification' : 'Continue'}
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    borderRadius: 16,
  },
});
