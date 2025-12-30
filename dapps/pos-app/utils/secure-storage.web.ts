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

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const storage = getStorage();
      if (storage) {
        const value = storage.getItem(getKey(key));
        return value ?? null;
      }
      return fallbackStorage.get(key) ?? null;
    } catch (error) {
      console.error(`Error getting secure item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem(getKey(key), value);
      } else {
        fallbackStorage.set(key, value);
      }
    } catch (error) {
      console.error(`Error setting secure item ${key}:`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(getKey(key));
      } else {
        fallbackStorage.delete(key);
      }
    } catch (error) {
      console.error(`Error removing secure item ${key}:`, error);
    }
  },
};

export const SECURE_STORAGE_KEYS = {
  MERCHANT_API_KEY: "merchant_api_key",
  PIN_HASH: "pin_hash",
} as const;
