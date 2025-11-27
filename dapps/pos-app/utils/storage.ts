import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV();

export const storage = {
  getKeys: async () => {
    return mmkv.getAllKeys();
  },
  getEntries: () => {
    function parseEntry(key: string): [string, any] {
      const value = mmkv.getString(key);
      return [key, safeJsonParse(value ?? "")];
    }

    const keys = mmkv.getAllKeys();
    return keys.map(parseEntry);
  },
  setItem: <T = any>(key: string, value: T) => {
    return mmkv.set(key, safeJsonStringify(value));
  },
  getItem: <T = any>(key: string): T | null => {
    const item = mmkv.getString(key);
    if (typeof item === "undefined" || item === null) {
      return null;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: (key: string) => {
    mmkv.remove(key);
  },
};
