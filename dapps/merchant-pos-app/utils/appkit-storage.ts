import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Storage } from "@reown/appkit-react-native";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";

/** AsyncStorage-backed Storage adapter that AppKit uses to persist sessions. */
export const appkitStorage: Storage = {
  getKeys: async () => {
    return (await AsyncStorage.getAllKeys()) as string[];
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    const keys = await AsyncStorage.getAllKeys();
    return await Promise.all(
      keys.map(
        async (key) =>
          [
            key,
            safeJsonParse((await AsyncStorage.getItem(key)) ?? "") as T,
          ] as [string, T],
      ),
    );
  },
  setItem: async <T = any>(key: string, value: T) => {
    await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const item = await AsyncStorage.getItem(key);
    if (typeof item === "undefined" || item === null) {
      return undefined;
    }
    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};
