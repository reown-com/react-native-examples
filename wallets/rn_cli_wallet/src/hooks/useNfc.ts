import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import NfcManager, {
  NfcEvents,
  NfcAdapter,
  Ndef,
} from 'react-native-nfc-manager';

import LogStore from '@/store/LogStore';

const ALLOWED_NFC_HOSTS = [
  'pay.walletconnect.com',
  'staging.pay.walletconnect.com',
  'dev.pay.walletconnect.com',
];

export function isAllowedNfcUri(uri: string): boolean {
  try {
    const { protocol, hostname } = new URL(uri);
    return (
      protocol === 'wc:' ||
      (protocol === 'https:' && ALLOWED_NFC_HOSTS.includes(hostname))
    );
  } catch {
    return false;
  }
}

let nfcStarted = false;
let foregroundDispatchPaused = false;
let foregroundRegistered = false;
let resumeForegroundDispatch: (() => void) | null = null;
let scanSessionId = 0;

async function ensureNfcStarted() {
  if (!nfcStarted) {
    await NfcManager.start();
    nfcStarted = true;
  }
}

function pauseForegroundDispatch() {
  foregroundDispatchPaused = true;
}

function unpauseForegroundDispatch() {
  foregroundDispatchPaused = false;
  foregroundRegistered = false;
  resumeForegroundDispatch?.();
}

export function useNfc() {
  const [isNfcSupported, setIsNfcSupported] = useState(false);

  useEffect(() => {
    ensureNfcStarted()
      .then(() => NfcManager.isSupported())
      .then(supported => {
        setIsNfcSupported(supported);
        LogStore.log(`NFC supported: ${supported}`, 'useNfc', 'init');
      })
      .catch(() => {
        setIsNfcSupported(false);
      });
  }, []);

  const scanNfcTag = useCallback(async (): Promise<string | null | undefined> => {
    pauseForegroundDispatch();
    try {
      await NfcManager.unregisterTagEvent().catch(() => {});

      return await new Promise<string | null | undefined>((resolve, reject) => {
        let resolved = false;
        const thisSession = ++scanSessionId;

        const cleanup = () => {
          NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
          NfcManager.setEventListener(NfcEvents.SessionClosed, null);
          NfcManager.unregisterTagEvent().catch(() => {});
        };

        NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
          if (thisSession !== scanSessionId) return;
          if (resolved) {
            return;
          }
          resolved = true;
          cleanup();
          resolve(undefined);
        });

        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
          if (thisSession !== scanSessionId) return;
          if (resolved) {
            return;
          }
          resolved = true;

          if (!tag?.ndefMessage?.length) {
            LogStore.log('No NDEF message on tag', 'useNfc', 'scanNfcTag');
            cleanup();
            resolve(null);
            return;
          }

          for (const record of tag.ndefMessage) {
            const uri = extractUri(record);
            if (uri) {
              LogStore.log(`NFC URI found: ${uri}`, 'useNfc', 'scanNfcTag');
              cleanup();
              resolve(uri);
              return;
            }
          }

          LogStore.log('No URI found in NDEF records', 'useNfc', 'scanNfcTag');
          cleanup();
          resolve(null);
        });

        NfcManager.registerTagEvent({
          alertMessage: 'Ready to Pay',
          invalidateAfterFirstRead: true,
        }).catch((error: any) => {
          if (thisSession !== scanSessionId) return;
          if (resolved) {
            return;
          }
          resolved = true;
          cleanup();
          if (error?.message?.includes('cancelled')) {
            resolve(undefined);
          } else {
            LogStore.log(
              `NFC scan error: ${error?.message}`,
              'useNfc',
              'scanNfcTag',
            );
            reject(error);
          }
        });
      });
    } finally {
      unpauseForegroundDispatch();
    }
  }, []);

  return {
    isNfcSupported,
    scanNfcTag,
  };
}

/**
 * Android-only: registers NFC foreground dispatch so tags are automatically
 * intercepted while the app is visible. Calls `onUri` with the parsed URI.
 */
export function useNfcForegroundDispatch(onUri: (uri: string) => void) {
  const onUriRef = useRef(onUri);
  onUriRef.current = onUri;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    let lastHandledUri = '';
    let lastHandledTime = 0;

    const register = async () => {
      if (foregroundRegistered || foregroundDispatchPaused) {
        return;
      }
      try {
        await ensureNfcStarted();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
          LogStore.log(
            'Foreground dispatch: tag discovered',
            'useNfc',
            'foregroundDispatch',
          );

          if (!tag?.ndefMessage?.length) {
            LogStore.log(
              'Foreground dispatch: no NDEF message',
              'useNfc',
              'foregroundDispatch',
            );
            return;
          }

          for (const record of tag.ndefMessage) {
            const uri = extractUri(record);
            if (uri) {
              // Debounce: skip duplicate tag reads within 3 seconds
              const now = Date.now();
              if (uri === lastHandledUri && now - lastHandledTime < 3000) {
                LogStore.log(
                  'Foreground dispatch: duplicate tag ignored',
                  'useNfc',
                  'foregroundDispatch',
                );
                return;
              }
              lastHandledUri = uri;
              lastHandledTime = now;

              LogStore.log(
                `Foreground dispatch URI: ${uri}`,
                'useNfc',
                'foregroundDispatch',
              );
              onUriRef.current(uri);
              return;
            }
          }

          LogStore.log(
            'Foreground dispatch: no URI in NDEF records',
            'useNfc',
            'foregroundDispatch',
          );
        });

        /* eslint-disable no-bitwise */
        const readerModeFlags =
          NfcAdapter.FLAG_READER_NFC_A |
          NfcAdapter.FLAG_READER_NFC_B |
          NfcAdapter.FLAG_READER_NFC_V;
        /* eslint-enable no-bitwise */
        await NfcManager.registerTagEvent({
          isReaderModeEnabled: true,
          readerModeFlags,
        });
        foregroundRegistered = true;
        LogStore.log(
          'NFC reader mode registered',
          'useNfc',
          'foregroundDispatch',
        );
      } catch (error: any) {
        LogStore.log(
          `Failed to register foreground dispatch: ${error?.message}`,
          'useNfc',
          'foregroundDispatch',
        );
      }
    };

    const unregister = async () => {
      if (!foregroundRegistered) {
        return;
      }
      try {
        await NfcManager.unregisterTagEvent();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        foregroundRegistered = false;
      } catch {
        // ignore
      }
    };

    register();

    resumeForegroundDispatch = () => register();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        register();
      } else {
        unregister();
      }
    });

    return () => {
      subscription.remove();
      resumeForegroundDispatch = null;
      unregister();
    };
  }, []);
}

function extractUri(record: {
  tnf: number;
  type: number[];
  payload: number[];
}): string | null {
  // TNF 3 = Absolute URI — the type field IS the URI
  if (record.tnf === 3 && record.type?.length) {
    return bytesToString(record.type);
  }

  // TNF 1 = Well-known type
  if (record.tnf === 1) {
    const typeStr = bytesToString(record.type);

    // RTD_URI (type = "U" / 0x55)
    if (typeStr === 'U' && record.payload?.length > 1) {
      return Ndef.uri.decodePayload(new Uint8Array(record.payload) as any);
    }

    // RTD_SMART_POSTER (type = "Sp") — contains nested NDEF with URI
    if (typeStr === 'Sp' && record.payload?.length) {
      try {
        const innerBytes = new Uint8Array(record.payload);
        const innerRecords = Ndef.decodeMessage(innerBytes as any);
        if (innerRecords) {
          for (const inner of innerRecords) {
            const uri = extractUri(inner as any);
            if (uri) {
              return uri;
            }
          }
        }
      } catch {
        // Failed to parse smart poster, skip
      }
    }
  }

  return null;
}

function bytesToString(bytes: number[]): string {
  let result = '';
  for (const byte of bytes) {
    result += String.fromCharCode(byte);
  }
  return result;
}
