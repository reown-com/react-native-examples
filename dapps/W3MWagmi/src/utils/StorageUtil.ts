import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import { Storage } from '@reown/appkit-react-native';

export const storage: Storage = {
  getKeys: async () => {
    return AsyncStorage.getAllKeys() as Promise<string[]>;
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    function parseEntry(entry: [string, string | null]): [string, any] {
      return [entry[0], safeJsonParse(entry[1] ?? '')];
    }

    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);

    return entries.map(parseEntry);
  },
  setItem: async (key: string, value: any) => {
    return await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const item = await AsyncStorage.getItem(key);
    if (typeof item === 'undefined' || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    return await AsyncStorage.removeItem(key);
  }
};
