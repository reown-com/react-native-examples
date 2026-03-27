import {MMKV} from 'react-native-mmkv';

import {safeJsonParse, safeJsonStringify} from '@walletconnect/safe-json';
import {Storage} from '@reown/appkit-react-native';

const mmkv = new MMKV();

export const storage: Storage = {
  getKeys: async () => {
    return mmkv.getAllKeys();
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    const keys = mmkv.getAllKeys();
    return keys.map(key => [
      key,
      safeJsonParse(mmkv.getString(key) ?? '') as T,
    ]);
  },
  setItem: async <T = any>(key: string, value: T) => {
    mmkv.set(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const item = mmkv.getString(key);
    if (typeof item === 'undefined' || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    mmkv.delete(key);
  },
};
