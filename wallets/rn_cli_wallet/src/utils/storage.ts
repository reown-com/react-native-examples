import { MMKV } from 'react-native-mmkv';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import { getEncryptionKey } from './secureEncryptionKey';

// Wallet secrets (mnemonics/private keys) and WalletConnect Core data are kept
// in a DEDICATED, encrypted MMKV instance — never the default store. Other
// modules (SettingsStore, WalletStore, LogStore) open the default `new MMKV()`
// without a key; if this data shared that instance, encrypting it would make
// their reads/writes fail. Isolating it under its own id avoids that conflict.
const SECURE_STORE_ID = 'wallet-secure';

// Created lazily because the encryption key must be fetched from the OS
// Keychain/Keystore first (async). On native the store is encrypted at rest; on
// web (no key) it falls back to the localStorage shim, unencrypted by design.
let mmkvPromise: Promise<MMKV> | undefined;

function getStore(): Promise<MMKV> {
  if (!mmkvPromise) {
    mmkvPromise = (async () => {
      const key = await getEncryptionKey();

      if (!key) {
        if (__DEV__) {
          console.log('[storage] secure MMKV opened UNENCRYPTED (web / no key)');
        }
        return new MMKV({ id: SECURE_STORE_ID });
      }

      if (__DEV__) {
        console.log('[storage] secure MMKV opened ENCRYPTED (key from SecureStore)');
      }
      return new MMKV({ id: SECURE_STORE_ID, encryptionKey: key });
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
