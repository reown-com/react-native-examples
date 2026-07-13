import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Owns the lifecycle of the MMKV encryption key. The key is generated once and
// persisted in the OS Keychain (iOS) / Keystore (Android) via expo-secure-store,
// so the key that protects the wallet secrets never sits in plaintext MMKV.
//
// Native-only: SecureStore is unavailable on web, and the react-native-mmkv web
// shim (localStorage) ignores encryption anyway — so on web we return undefined
// and the secure store stays best-effort/unencrypted by design.

const SECURE_STORE_KEY = 'mmkv_encryption_key';

// MMKV's encryption key cannot exceed 16 bytes. We generate 12 random bytes and
// base64-encode them into a 16-character (16-byte) key — 96 bits of entropy,
// the most that fits within MMKV's limit.
function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  // Buffer is polyfilled globally by '@walletconnect/react-native-compat'.
  return Buffer.from(bytes).toString('base64');
}

let keyPromise: Promise<string | undefined> | undefined;

// Resolves the MMKV encryption key, generating and persisting it on first use.
// Returns undefined on web (no native secure storage available).
export function getEncryptionKey(): Promise<string | undefined> {
  if (!keyPromise) {
    keyPromise = (async () => {
      if (Platform.OS === 'web') {
        return undefined;
      }

      const existing = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (existing) {
        return existing;
      }

      const key = generateKey();
      await SecureStore.setItemAsync(SECURE_STORE_KEY, key);
      return key;
    })();
  }
  return keyPromise;
}
