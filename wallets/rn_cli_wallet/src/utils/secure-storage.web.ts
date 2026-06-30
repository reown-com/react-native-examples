import { storage } from './storage';

/**
 * Web variant of secure-storage. expo-secure-store is native-only (no Keychain/
 * Keystore in the browser), so on web we keep the existing posture: key material
 * stays in the localStorage-backed MMKV shim, under the same keys it already
 * used. This means there's no web migration and existing web wallets are
 * untouched — `migrateSecret` is a no-op here.
 *
 * Note: this is NOT actually secure on web; it matches the prior behavior and is
 * acceptable for this sample app.
 */
export const secureStorage = {
  async getSecret(key: string): Promise<string | undefined> {
    return storage.getItem<string>(key);
  },

  async setSecret(key: string, value: string): Promise<void> {
    await storage.setItem(key, value);
  },

  async removeSecret(key: string): Promise<void> {
    await storage.removeItem(key);
  },

  async hasSecret(key: string): Promise<boolean> {
    return (await storage.getItem<string>(key)) != null;
  },

  async migrateSecret(_key: string): Promise<void> {
    // No-op on web: secrets already live in localStorage-backed storage.
  },
};
