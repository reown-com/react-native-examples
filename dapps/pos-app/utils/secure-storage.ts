import * as SecureStore from "expo-secure-store";
import { storage } from "./storage";

const KEYS = {
  CUSTOMER_API_KEY: "customer_api_key",
  PIN_HASH: "pin_hash",
} as const;
const LEGACY_CUSTOMER_API_KEYS = ["merchant_api_key", "partner_api_key"] as const;

const FRESH_INSTALL_KEY = "app_has_launched";
const CUSTOMER_API_KEY_MIGRATION_KEY =
  "migration_customer_api_key_completed";

export async function clearStaleSecureStorage(): Promise<void> {
  const hasLaunchedBefore = storage.getItem<boolean>(FRESH_INSTALL_KEY);

  if (!hasLaunchedBefore) {
    await SecureStore.deleteItemAsync(KEYS.CUSTOMER_API_KEY);
    for (const legacyKey of LEGACY_CUSTOMER_API_KEYS) {
      await SecureStore.deleteItemAsync(legacyKey);
    }
    await SecureStore.deleteItemAsync(KEYS.PIN_HASH);

    storage.setItem(FRESH_INSTALL_KEY, true);
  }
}

/**
 * Migrates customer API key from old storage keys to new one.
 * Handles both legacy key names: "merchant_api_key" and "partner_api_key".
 * Tracks completion to avoid running on every app start.
 * @returns true if migration was performed, false if skipped
 */
export async function migrateCustomerApiKey(): Promise<boolean> {
  const migrationCompleted = storage.getItem<boolean>(
    CUSTOMER_API_KEY_MIGRATION_KEY,
  );
  if (migrationCompleted) return false;

  const OLD_KEYS = LEGACY_CUSTOMER_API_KEYS;
  const NEW_KEY = "customer_api_key";

  let migrated = false;
  const existingNewValue = await SecureStore.getItemAsync(NEW_KEY);

  for (const oldKey of OLD_KEYS) {
    const oldValue = await SecureStore.getItemAsync(oldKey);
    if (oldValue) {
      if (!existingNewValue && !migrated) {
        await SecureStore.setItemAsync(NEW_KEY, oldValue);
        migrated = true;
      }
      await SecureStore.deleteItemAsync(oldKey);
    }
  }

  storage.setItem(CUSTOMER_API_KEY_MIGRATION_KEY, true);
  return migrated;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure item`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting secure item`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing secure item`, error);
    }
  },
};

export const SECURE_STORAGE_KEYS = KEYS;
