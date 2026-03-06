/**
 * ⚠️ SECURITY WARNING - WEB PLATFORM LIMITATION
 *
 * This web implementation uses localStorage which stores data in PLAIN TEXT. For development purposes only.
 *
 * Sensitive data stored here (API keys, PIN hashes) can be read by anyone
 * with access to the browser. For production web deployments, consider:
 * - Using Web Crypto API for encryption
 * - Server-side storage with secure session tokens
 * - Limiting web usage to non-sensitive operations
 */

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

// Fallback storage for SSR/Node.js environments
const fallbackStorage = new Map<string, string>();

const getStorage = () => {
  if (isBrowser) {
    return window.localStorage;
  }
  return null;
};

// Prefix for secure storage keys to avoid conflicts
const SECURE_STORAGE_PREFIX = "__secure__";

const getKey = (key: string) => `${SECURE_STORAGE_PREFIX}${key}`;

export async function clearStaleSecureStorage(): Promise<void> {}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const storage = getStorage();
      const prefixedKey = getKey(key);
      if (storage) {
        const value = storage.getItem(prefixedKey);
        return value ?? null;
      }
      return fallbackStorage.get(prefixedKey) ?? null;
    } catch (error) {
      console.error(`Error getting secure item`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const storage = getStorage();
      const prefixedKey = getKey(key);
      if (storage) {
        storage.setItem(prefixedKey, value);
      } else {
        fallbackStorage.set(prefixedKey, value);
      }
    } catch (error) {
      console.error(`Error setting secure item`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const storage = getStorage();
      const prefixedKey = getKey(key);
      if (storage) {
        storage.removeItem(prefixedKey);
      } else {
        fallbackStorage.delete(prefixedKey);
      }
    } catch (error) {
      console.error(`Error removing secure item`, error);
    }
  },
};

export const SECURE_STORAGE_KEYS = {
  CUSTOMER_API_KEY: "customer_api_key",
  PIN_HASH: "pin_hash",
} as const;

const CUSTOMER_API_KEY_MIGRATION_KEY = "migration_customer_api_key_completed";

/**
 * Migrates customer API key from old storage keys to new one.
 * Handles both legacy key names: "merchant_api_key" and "partner_api_key".
 * Tracks completion to avoid running on every app start.
 * @returns true if migration was performed, false if skipped
 */
export async function migrateCustomerApiKey(): Promise<boolean> {
  const storage = getStorage();
  if (!storage) return false;

  const migrationCompleted = storage.getItem(CUSTOMER_API_KEY_MIGRATION_KEY);
  if (migrationCompleted === "true") return false;

  const OLD_KEYS = [getKey("merchant_api_key"), getKey("partner_api_key")];
  const NEW_KEY = getKey("customer_api_key");

  let migrated = false;
  const existingNewValue = storage.getItem(NEW_KEY);

  for (const oldKey of OLD_KEYS) {
    const oldValue = storage.getItem(oldKey);
    if (oldValue) {
      if (!existingNewValue && !migrated) {
        storage.setItem(NEW_KEY, oldValue);
        migrated = true;
      }
      storage.removeItem(oldKey);
    }
  }

  storage.setItem(CUSTOMER_API_KEY_MIGRATION_KEY, "true");
  return migrated;
}
