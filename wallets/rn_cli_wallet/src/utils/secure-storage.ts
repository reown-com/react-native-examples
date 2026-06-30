import * as SecureStore from 'expo-secure-store';
import { storage } from './storage';
import LogStore, { serializeError } from '@/store/LogStore';

/**
 * Secure storage for sensitive wallet key material (mnemonics, private/secret
 * keys). Backed by the platform secure enclave:
 *   - iOS: Keychain Services
 *   - Android: Keystore system
 *
 * On web this module is replaced by `secure-storage.web.ts` (expo-secure-store
 * is native-only), which delegates to the existing localStorage-backed storage.
 *
 * Key material previously lived in plaintext MMKV. `migrateSecret` performs a
 * one-time, in-place move so existing installs in the wild are not wiped: the
 * value is copied to the secure enclave and the legacy MMKV copy is deleted.
 */
export const secureStorage = {
  async getSecret(key: string): Promise<string | undefined> {
    const value = await SecureStore.getItemAsync(key);
    return value ?? undefined;
  },

  async setSecret(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async removeSecret(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async hasSecret(key: string): Promise<boolean> {
    return (await SecureStore.getItemAsync(key)) != null;
  },

  /**
   * One-time migration from legacy unencrypted MMKV storage to the secure
   * enclave. No-op if the secure store already has the key or if there's
   * nothing legacy to migrate. Must run before reading a key for the first
   * time after upgrade.
   */
  async migrateSecret(key: string): Promise<void> {
    try {
      const alreadySecure = await SecureStore.getItemAsync(key);
      if (alreadySecure != null) {
        return;
      }

      const legacyValue = await storage.getItem<string>(key);
      if (legacyValue == null) {
        return;
      }

      await SecureStore.setItemAsync(key, legacyValue);
      await storage.removeItem(key);

      LogStore.log(
        `Migrated ${key} from MMKV to secure storage`,
        'SecureStorage',
        'migrateSecret',
      );
    } catch (error) {
      // Re-throw: a failed migration must not silently fall through to wallet
      // generation (which would orphan the user's existing key). The legacy
      // MMKV copy is left intact so the next launch can retry.
      LogStore.error(
        `Failed to migrate ${key} to secure storage`,
        'SecureStorage',
        'migrateSecret',
        { error: serializeError(error) },
      );
      throw error;
    }
  },
};
