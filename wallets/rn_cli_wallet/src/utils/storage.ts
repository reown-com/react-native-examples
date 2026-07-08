import { MMKV } from 'react-native-mmkv';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import { getEncryptionKey } from './secureEncryptionKey';

// The MMKV instance is created lazily because the encryption key must be
// fetched from the OS Keychain/Keystore first (async). On native the store is
// encrypted at rest; on web (no key) it falls back to the localStorage shim,
// which is unencrypted by design.
let mmkvPromise: Promise<MMKV> | undefined;

function getStore(): Promise<MMKV> {
  if (!mmkvPromise) {
    mmkvPromise = (async () => {
      const { key, isNew } = await getEncryptionKey();

      if (!key) {
        if (__DEV__) {
          console.log('[storage] MMKV opened UNENCRYPTED (web / no key available)');
        }
        return new MMKV();
      }

      if (isNew) {
        // Existing installs have an unencrypted default store on disk. Open it
        // in plaintext, then encrypt it in place so previously stored wallet
        // secrets survive the upgrade instead of appearing reset.
        const instance = new MMKV();
        instance.recrypt(key);
        if (__DEV__) {
          console.log(
            '[storage] MMKV recrypted in place with new key (first run / plaintext→encrypted migration)',
          );
        }
        return instance;
      }

      if (__DEV__) {
        console.log('[storage] MMKV opened ENCRYPTED with existing key from SecureStore');
      }
      return new MMKV({ encryptionKey: key });
    })();
  }
  return mmkvPromise;
}

export const storage = {
  getKeys: async () => {
    const mmkv = await getStore();
    return mmkv.getAllKeys();
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    const mmkv = await getStore();

    function parseEntry(key: string): [string, any] {
      const value = mmkv.getString(key);
      return [key, safeJsonParse(value ?? '')];
    }

    const keys = mmkv.getAllKeys();
    return keys.map(parseEntry);
  },
  setItem: async <T = any>(key: string, value: T) => {
    const mmkv = await getStore();
    return mmkv.set(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const mmkv = await getStore();
    const item = mmkv.getString(key);
    if (typeof item === 'undefined' || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    const mmkv = await getStore();
    return mmkv.delete(key);
  },
};
