import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Owns the lifecycle of the MMKV encryption key. The key is generated once and
// persisted in the OS Keychain (iOS) / Keystore (Android) via expo-secure-store,
// so the key that protects the wallet secrets never sits in plaintext MMKV.
//
// Native-only: SecureStore is unavailable on web, and the react-native-mmkv web
// shim (localStorage) ignores encryption anyway — so on web we return undefined
// and storage stays best-effort/unencrypted by design.

const SECURE_STORE_KEY = 'mmkv_encryption_key';

// MMKV's encryption key cannot exceed 16 bytes, so we generate 8 random bytes
// and hex-encode them into a 16-character key.
function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface EncryptionKeyResult {
  // The MMKV encryption key, or undefined on web (no encryption available).
  key: string | undefined;
  // True when the key was just generated this launch — meaning an existing
  // unencrypted MMKV store may need to be recrypted in place before use.
  isNew: boolean;
}

let keyPromise: Promise<EncryptionKeyResult> | undefined;

export function getEncryptionKey(): Promise<EncryptionKeyResult> {
  if (!keyPromise) {
    keyPromise = (async () => {
      if (Platform.OS === 'web') {
        return { key: undefined, isNew: false };
      }

      const existing = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (existing) {
        return { key: existing, isNew: false };
      }

      const key = generateKey();
      await SecureStore.setItemAsync(SECURE_STORE_KEY, key);
      return { key, isNew: true };
    })();
  }
  return keyPromise;
}
