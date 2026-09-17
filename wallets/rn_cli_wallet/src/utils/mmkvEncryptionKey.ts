import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ENV } from './env';

// Owns the lifecycle of the MMKV encryption key. The key is generated once and
// persisted in the OS Keychain (iOS) / Keystore (Android), so the key that
// protects wallet secrets never sits in plaintext MMKV.

const ENCRYPTION_KEY_ENTRY = 'mmkv_encryption_key';
const EXPO_SECURE_STORE_TIMEOUT_MS = 4000;
const E2E_ENCRYPTION_KEY = 'wallet-e2e-key!!';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`SecureStore timed out after ${ms}ms`)),
      ms,
    );

    promise.then(
      value => {
        clearTimeout(timeout);
        resolve(value);
      },
      error => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

// MMKV encryption keys cannot exceed 16 bytes. Twelve random bytes encode to
// exactly 16 base64 characters, providing 96 bits of entropy.
function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  // Buffer is installed globally by @walletconnect/react-native-compat.
  return Buffer.from(bytes).toString('base64');
}

let keyPromise: Promise<string | undefined> | undefined;

async function loadEncryptionKey(
  mustHaveExistingKey: boolean,
): Promise<string | undefined> {
  // SecureStore and MMKV encryption are unavailable in the browser. The web
  // storage shim remains explicitly best-effort and unencrypted.
  if (Platform.OS === 'web') {
    return undefined;
  }

  // The unsigned iOS E2E app has no Keychain entitlement. Test mode uses a
  // known key for its disposable simulator data and never attempts to persist
  // production wallet material.
  if (ENV.TEST_MODE === 'true') {
    return E2E_ENCRYPTION_KEY;
  }

  try {
    const existing = await withTimeout(
      SecureStore.getItemAsync(ENCRYPTION_KEY_ENTRY),
      EXPO_SECURE_STORE_TIMEOUT_MS,
    );
    if (existing) {
      return existing;
    }

    if (mustHaveExistingKey) {
      throw new Error('the encryption key is missing for existing wallet data');
    }

    const key = generateKey();
    await withTimeout(
      SecureStore.setItemAsync(ENCRYPTION_KEY_ENTRY, key),
      EXPO_SECURE_STORE_TIMEOUT_MS,
    );
    return key;
  } catch (error) {
    // Never downgrade wallet secrets to plaintext. WalletConnect itself no
    // longer waits for this path, and wallet restoration can surface the
    // secure-storage error independently.
    const reason = error instanceof Error ? `: ${error.message}` : '';
    throw new Error(
      `OS-backed MMKV encryption-key storage is unavailable; refusing to access wallet secrets${reason}`,
    );
  }
}

export function getEncryptionKey(
  mustHaveExistingKey = false,
): Promise<string | undefined> {
  if (!keyPromise) {
    keyPromise = loadEncryptionKey(mustHaveExistingKey);
  }
  return keyPromise;
}
