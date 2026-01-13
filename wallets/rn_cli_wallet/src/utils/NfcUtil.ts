import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { Platform, Linking } from 'react-native';

export async function initNfc(): Promise<boolean> {
  try {
    const supported = await NfcManager.isSupported();
    if (!supported) {
      return false;
    }
    await NfcManager.start();
    return true;
  } catch {
    return false;
  }
}

export async function isNfcEnabled(): Promise<boolean> {
  try {
    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

export async function readNdefTag(): Promise<string | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    if (!tag?.ndefMessage || tag.ndefMessage.length === 0) {
      return null;
    }

    const ndefRecord = tag.ndefMessage[0];
    const payload = Ndef.uri.decodePayload(new Uint8Array(ndefRecord.payload));

    return payload;
  } catch {
    return null;
  } finally {
    await cancelNfcScan();
  }
}

export async function cancelNfcScan(): Promise<void> {
  try {
    await NfcManager.cancelTechnologyRequest();
  } catch {
    // Ignore errors when canceling
  }
}

export function openNfcSettings(): void {
  if (Platform.OS === 'android') {
    NfcManager.goToNfcSetting();
  } else {
    Linking.openSettings();
  }
}

export function registerNfcListener(
  onTagDiscovered: (uri: string) => void,
): () => void {
  const handleTag = (tag: any) => {
    if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
      try {
        const ndefRecord = tag.ndefMessage[0];
        const payload = Ndef.uri.decodePayload(
          new Uint8Array(ndefRecord.payload),
        );
        if (payload) {
          onTagDiscovered(payload);
        }
      } catch {
        // Invalid NDEF format
      }
    }
  };

  NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTag);

  return () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  };
}
