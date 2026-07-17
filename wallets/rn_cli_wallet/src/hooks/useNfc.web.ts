// Web no-op variant of useNfc — react-native-nfc-manager has no web support.
// Keeps the same exports/shapes as the native hook so callers are unchanged.
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

export function useNfc() {
  return {
    isNfcSupported: false,
    scanNfcTag: async (): Promise<string | null | undefined> => null,
  };
}

export function useNfcForegroundDispatch(_onUri: (uri: string) => void) {
  // NFC foreground dispatch is Android-only; no-op on web.
}
