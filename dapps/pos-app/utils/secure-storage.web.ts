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
  PARTNER_API_KEY: "partner_api_key",
  PIN_HASH: "pin_hash",
} as const;

export async function migratePartnerApiKey(): Promise<void> {
  const OLD_KEY = getKey("merchant_api_key");
  const NEW_KEY = getKey("partner_api_key");

  const storage = getStorage();
  if (!storage) return;

  const oldValue = storage.getItem(OLD_KEY);
  if (oldValue) {
    const newValue = storage.getItem(NEW_KEY);
    if (!newValue) {
      storage.setItem(NEW_KEY, oldValue);
    }
    storage.removeItem(OLD_KEY);
  }
}
