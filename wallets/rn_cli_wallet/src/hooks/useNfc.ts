import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import NfcManager, {
  NfcTech,
  NfcEvents,
  NfcAdapter,
  Ndef,
} from 'react-native-nfc-manager';

import LogStore from '@/store/LogStore';

let foregroundDispatchPaused = false;
let resumeForegroundDispatch: (() => void) | null = null;

export function pauseForegroundDispatch() {
  foregroundDispatchPaused = true;
}

export function unpauseForegroundDispatch() {
  foregroundDispatchPaused = false;
  resumeForegroundDispatch?.();
}

export function useNfc() {
  const [isNfcSupported, setIsNfcSupported] = useState(false);

  useEffect(() => {
    NfcManager.start()
      .then(() => NfcManager.isSupported())
      .then(supported => {
        setIsNfcSupported(supported);
        LogStore.log(`NFC supported: ${supported}`, 'useNfc', 'init');
      })
      .catch(() => {
        setIsNfcSupported(false);
      });
  }, []);

  const scanNfcTag = useCallback(async (): Promise<string | null> => {
    // Pause foreground dispatch on Android so requestTechnology doesn't conflict
    pauseForegroundDispatch();
    try {
      // Cancel any stale session from a previous scan attempt (e.g. user
      // tapped the button twice on Android where there's no native dialog).
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      await NfcManager.unregisterTagEvent().catch(() => {});
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (!tag?.ndefMessage?.length) {
        LogStore.log('No NDEF message on tag', 'useNfc', 'scanNfcTag');
        return null;
      }

      for (const record of tag.ndefMessage) {
        const uri = extractUri(record);
        if (uri) {
          LogStore.log(`NFC URI found: ${uri}`, 'useNfc', 'scanNfcTag');
          return uri;
        }
      }

      LogStore.log('No URI found in NDEF records', 'useNfc', 'scanNfcTag');
      return null;
    } catch (error: any) {
      // User cancelled — not an error
      if (error?.message?.includes('cancelled')) {
        return null;
      }
      LogStore.log(`NFC scan error: ${error?.message}`, 'useNfc', 'scanNfcTag');
      throw error;
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
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

    let registered = false;

    const register = async () => {
      if (registered || foregroundDispatchPaused) {
        return;
      }
      try {
        await NfcManager.start();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
          LogStore.log(
            `Foreground dispatch: tag discovered`,
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
        registered = true;
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
      if (!registered) {
        return;
      }
      try {
        await NfcManager.unregisterTagEvent();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        registered = false;
      } catch {
        // ignore
      }
    };

    // Register immediately
    register();

    // Allow manual scan to re-register foreground dispatch after it finishes
    resumeForegroundDispatch = () => register();

    // Re-register when app comes back to foreground
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
  return String.fromCharCode(...bytes);
}
