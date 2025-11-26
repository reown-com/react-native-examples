import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV();

export const storage = {
  getKeys: async () => {
    return mmkv.getAllKeys();
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    function parseEntry(key: string): [string, any] {
      const value = mmkv.getString(key);
      return [key, safeJsonParse(value ?? "")];
    }

    const keys = mmkv.getAllKeys();
    return keys.map(parseEntry);
  },
  setItem: async <T = any>(key: string, value: T) => {
    return mmkv.set(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const item = mmkv.getString(key);
    if (typeof item === "undefined" || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    mmkv.remove(key);
    return;
  },
};
