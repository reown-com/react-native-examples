import { Storage } from "@reown/appkit-react-native";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";

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

export const storage: Storage = {
  getKeys: async () => {
    const storage = getStorage();
    if (storage) {
      return Object.keys(storage);
    }
    return Array.from(fallbackStorage.keys());
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    function parseEntry(key: string): [string, any] {
      const storage = getStorage();
      const value = storage
        ? storage.getItem(key)
        : (fallbackStorage.get(key) ?? null);
      return [key, safeJsonParse(value ?? "")];
    }

    const storage = getStorage();
    const keys = storage
      ? Object.keys(storage)
      : Array.from(fallbackStorage.keys());
    return keys.map(parseEntry);
  },
  setItem: async <T = any>(key: string, value: T) => {
    const storage = getStorage();
    const stringValue = safeJsonStringify(value);
    if (storage) {
      storage.setItem(key, stringValue);
    } else {
      fallbackStorage.set(key, stringValue);
    }
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const storage = getStorage();
    const item = storage
      ? storage.getItem(key)
      : (fallbackStorage.get(key) ?? null);
    if (item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    } else {
      fallbackStorage.delete(key);
    }
    return;
  },
};
