import { MMKV } from 'react-native-mmkv';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import { getEncryptionKey } from './mmkvEncryptionKey';

// WalletConnect Core and ordinary app preferences must remain in the default
// MMKV store. Several modules open that store synchronously without an
// encryption key, so encrypting it in place makes those readers fail.
const defaultStore = new MMKV();

// The persisted ids must stay stable across upgrades even though the constant
// names now make it explicit that these are MMKV databases, not SecureStore.
const ENCRYPTED_MMKV_ID = 'wallet-secure';
const ENCRYPTED_MMKV_METADATA_ID = 'wallet-secure-metadata';
const ENCRYPTED_DATA_MARKER = 'has-encrypted-wallet-data';
const encryptionMetadata = new MMKV({ id: ENCRYPTED_MMKV_METADATA_ID });

// Keep this list explicit: only wallet key material belongs in the encrypted
// store. Everything else, including WalletConnect sessions, retains its
// existing storage location and upgrade behavior.
const SECRET_KEYS = new Set([
  'EIP155_MNEMONIC_1',
  'EIP155_PRIVATE_KEY_1',
  'SUI_MNEMONIC_1',
  'TON_SECRET_KEY_1',
  'TRON_PrivateKey_1',
  'CANTON_SECRET_KEY_1',
  'SOLANA_MNEMONIC_1',
  'SOLANA_SECRET_KEY_1',
  'BITCOIN_MNEMONIC_1',
  'STELLAR_MNEMONIC_1',
  'STELLAR_SECRET_KEY_1',
]);

let encryptedMmkvPromise: Promise<MMKV> | undefined;

function isSecretKey(key: string): boolean {
  return SECRET_KEYS.has(key);
}

function getNonSecretKeys(): string[] {
  return defaultStore.getAllKeys().filter(key => !isSecretKey(key));
}

function getEncryptedMmkv(): Promise<MMKV> {
  if (!encryptedMmkvPromise) {
    const mustHaveExistingKey =
      encryptionMetadata.getString(ENCRYPTED_DATA_MARKER) === 'true';
    encryptedMmkvPromise = getEncryptionKey(mustHaveExistingKey).then(key => {
      // The web MMKV shim is localStorage-backed and does not support
      // encryption. A separate id still keeps secret and ordinary data apart.
      if (!key) {
        return new MMKV({ id: ENCRYPTED_MMKV_ID });
      }

      return new MMKV({ id: ENCRYPTED_MMKV_ID, encryptionKey: key });
    });
  }
  return encryptedMmkvPromise;
}

function parseItem<T>(item: string | undefined): T | undefined {
  if (typeof item === 'undefined' || item === null) {
    return undefined;
  }
  return safeJsonParse(item) as T;
}

function setAndVerify(store: MMKV, key: string, serialized: string): void {
  store.set(key, serialized);
  if (store.getString(key) !== serialized) {
    throw new Error(`Failed to verify encrypted wallet storage for ${key}`);
  }
}

function markEncryptedDataPresent(): void {
  encryptionMetadata.set(ENCRYPTED_DATA_MARKER, 'true');
  if (encryptionMetadata.getString(ENCRYPTED_DATA_MARKER) !== 'true') {
    throw new Error('Failed to persist encrypted MMKV metadata');
  }
}

// Migrate one secret at a time. Writing and verifying before deleting makes
// this safe to retry if the app exits at any point during an upgrade.
async function getSecretItem<T>(key: string): Promise<T | undefined> {
  const encryptedMmkv = await getEncryptedMmkv();
  const encryptedValue = encryptedMmkv.getString(key);
  const legacy = defaultStore.getString(key);

  if (typeof encryptedValue !== 'undefined') {
    const parsed = parseItem<T>(encryptedValue);
    markEncryptedDataPresent();
    // Clean up a legacy copy left by an interrupted migration.
    if (typeof legacy !== 'undefined') {
      defaultStore.delete(key);
    }
    return parsed;
  }

  if (typeof legacy === 'undefined') {
    return undefined;
  }

  const parsed = parseItem<T>(legacy);
  setAndVerify(encryptedMmkv, key, legacy);
  markEncryptedDataPresent();
  defaultStore.delete(key);
  return parsed;
}

export const storage = {
  // WalletConnect uses these methods to hydrate its own records. Returning the
  // default store preserves existing sessions. Filtering also prevents legacy
  // plaintext secrets from entering WalletConnect's in-memory storage cache
  // while their background migration is still pending.
  getKeys: async () => getNonSecretKeys(),
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    function parseEntry(key: string): [string, any] {
      return [key, safeJsonParse(defaultStore.getString(key) ?? '')];
    }

    return getNonSecretKeys().map(parseEntry);
  },
  setItem: async <T = any>(key: string, value: T) => {
    const serialized = safeJsonStringify(value);
    if (!isSecretKey(key)) {
      return defaultStore.set(key, serialized);
    }

    const encryptedMmkv = await getEncryptedMmkv();
    setAndVerify(encryptedMmkv, key, serialized);
    markEncryptedDataPresent();
    // Remove a previous plaintext value only after the encrypted write has
    // been verified.
    defaultStore.delete(key);
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    if (isSecretKey(key)) {
      return getSecretItem<T>(key);
    }
    return parseItem<T>(defaultStore.getString(key));
  },
  removeItem: async (key: string) => {
    if (!isSecretKey(key)) {
      return defaultStore.delete(key);
    }

    // Do not report success while a secret may still exist in either store.
    const encryptedMmkv = await getEncryptedMmkv();
    encryptedMmkv.delete(key);
    if (typeof encryptedMmkv.getString(key) !== 'undefined') {
      throw new Error(`Failed to remove ${key} from encrypted wallet storage`);
    }
    defaultStore.delete(key);
  },
};
