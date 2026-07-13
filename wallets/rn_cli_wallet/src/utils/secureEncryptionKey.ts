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

// Upper bound on how long we wait for the Keychain/Keystore before giving up.
// On real signed builds SecureStore resolves in milliseconds; on an unsigned
// build (E2E) the Keychain can stall on the securityd/KeychainMigrator path,
// and this call sits on the app-init critical path — so we cap it to avoid the
// splash screen hanging, falling back to unencrypted storage on timeout.
const SECURE_STORE_TIMEOUT_MS = 4000;

class SecureStoreTimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  // Swallow a late rejection so it doesn't surface as an unhandled rejection
  // once the timeout has already won the race.
  promise.catch(() => {});
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new SecureStoreTimeoutError(`SecureStore timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

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

      try {
        const existing = await withTimeout(
          SecureStore.getItemAsync(SECURE_STORE_KEY),
          SECURE_STORE_TIMEOUT_MS,
        );
        if (existing) {
          return existing;
        }

        const key = generateKey();
        await withTimeout(
          SecureStore.setItemAsync(SECURE_STORE_KEY, key),
          SECURE_STORE_TIMEOUT_MS,
        );
        return key;
      } catch (err) {
        // The Keychain/Keystore can be unavailable or stall — e.g. an UNSIGNED
        // iOS build (our E2E simulator archive is built with
        // CODE_SIGNING_ALLOWED=NO) has no application-identifier entitlement, so
        // Keychain access fails or hangs on the securityd migration path. Fall
        // back to an unencrypted store so the app still initializes instead of
        // hanging on the splash screen; encryption stays active on real signed
        // builds, where SecureStore resolves quickly.
        console.warn(
          '[secureEncryptionKey] Keychain/Keystore unavailable; wallet storage will be unencrypted on this build:',
          err,
        );
        return undefined;
      }
    })();
  }
  return keyPromise;
}
