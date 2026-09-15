const mockStores = new Map<string, Map<string, string>>();
const mockDroppedWrites = new Set<string>();
const mockConfigurations: Array<{
  id: string;
  encryptionKey?: string;
}> = [];

jest.mock('react-native-mmkv', () => ({
  MMKV: class {
    private values: Map<string, string>;

    constructor(config: { id?: string; encryptionKey?: string } = {}) {
      const id = config.id ?? 'default';
      if (!mockStores.has(id)) {
        mockStores.set(id, new Map());
      }
      this.values = mockStores.get(id)!;
      mockConfigurations.push({ id, encryptionKey: config.encryptionKey });
    }

    getString(key: string) {
      return this.values.get(key);
    }

    set(key: string, value: string) {
      if (mockDroppedWrites.has(key)) {
        return;
      }
      this.values.set(key, value);
    }

    delete(key: string) {
      this.values.delete(key);
    }

    getAllKeys() {
      return [...this.values.keys()];
    }
  },
}));

const mockGetEncryptionKey = jest.fn();
jest.mock('../src/utils/mmkvEncryptionKey', () => ({
  getEncryptionKey: mockGetEncryptionKey,
}));

function getMockStore(id: string): Map<string, string> {
  if (!mockStores.has(id)) {
    mockStores.set(id, new Map());
  }
  return mockStores.get(id)!;
}

const defaultStore = () => getMockStore('default');
const encryptedMmkv = () => getMockStore('wallet-secure');
function loadStorage() {
  let result: typeof import('../src/utils/storage').storage;
  jest.isolateModules(() => {
    result = (
      require('../src/utils/storage') as typeof import('../src/utils/storage')
    ).storage;
  });
  return result!;
}

describe('wallet secret storage', () => {
  beforeEach(() => {
    mockStores.forEach(store => store.clear());
    mockDroppedWrites.clear();
    mockConfigurations.length = 0;
    mockGetEncryptionKey.mockReset().mockResolvedValue('test-secret-key');
  });

  it('migrates a legacy mnemonic before deleting the plaintext value', async () => {
    const storage = loadStorage();
    defaultStore().set('EIP155_MNEMONIC_1', 'seed phrase');

    await expect(storage.getItem('EIP155_MNEMONIC_1')).resolves.toBe(
      'seed phrase',
    );

    expect(encryptedMmkv().get('EIP155_MNEMONIC_1')).toBe('seed phrase');
    expect(defaultStore().has('EIP155_MNEMONIC_1')).toBe(false);
    expect(mockConfigurations).toContainEqual({
      id: 'wallet-secure',
      encryptionKey: 'test-secret-key',
    });
  });

  it('prefers an encrypted value and cleans up an interrupted migration', async () => {
    const storage = loadStorage();
    encryptedMmkv().set('SOLANA_MNEMONIC_1', 'new phrase');
    defaultStore().set('SOLANA_MNEMONIC_1', 'old phrase');

    await expect(storage.getItem('SOLANA_MNEMONIC_1')).resolves.toBe(
      'new phrase',
    );
    expect(defaultStore().has('SOLANA_MNEMONIC_1')).toBe(false);
  });

  it('leaves WalletConnect and preference records in the default store', async () => {
    const storage = loadStorage();
    await storage.setItem('wc@2:client:0.3//session', { topic: 'abc' });
    await storage.setItem('TEST_NETS', 'YES');

    expect(defaultStore().get('wc@2:client:0.3//session')).toBe(
      JSON.stringify({ topic: 'abc' }),
    );
    expect(defaultStore().get('TEST_NETS')).toBe('YES');
    await expect(storage.getKeys()).resolves.toEqual([
      'wc@2:client:0.3//session',
      'TEST_NETS',
    ]);
    expect(mockGetEncryptionKey).not.toHaveBeenCalled();
  });

  it('keeps legacy secrets out of WalletConnect storage scans', async () => {
    const storage = loadStorage();
    defaultStore().set('BITCOIN_MNEMONIC_1', 'seed phrase');
    defaultStore().set('wc@2:core:0.3//pairing', JSON.stringify({ topic: 'abc' }));

    await expect(storage.getKeys()).resolves.toEqual([
      'wc@2:core:0.3//pairing',
    ]);
    await expect(storage.getEntries()).resolves.toEqual([
      ['wc@2:core:0.3//pairing', { topic: 'abc' }],
    ]);
    expect(defaultStore().has('BITCOIN_MNEMONIC_1')).toBe(true);
  });

  it('keeps the plaintext value when encrypted-write verification fails', async () => {
    const storage = loadStorage();
    defaultStore().set('TON_SECRET_KEY_1', 'legacy secret');
    mockDroppedWrites.add('TON_SECRET_KEY_1');

    await expect(storage.getItem('TON_SECRET_KEY_1')).rejects.toThrow(
      'Failed to verify encrypted wallet storage',
    );
    expect(defaultStore().get('TON_SECRET_KEY_1')).toBe('legacy secret');
  });

  it('requires the existing encryption key after encrypted data was written', async () => {
    encryptedMmkv().set('STELLAR_SECRET_KEY_1', 'secret');
    getMockStore('wallet-secure-metadata').set(
      'has-encrypted-wallet-data',
      'true',
    );
    const storage = loadStorage();

    await expect(storage.getItem('STELLAR_SECRET_KEY_1')).resolves.toBe(
      'secret',
    );
    expect(mockGetEncryptionKey).toHaveBeenCalledWith(true);
  });

  it('does not write a secret to plaintext when encryption-key storage fails', async () => {
    const storage = loadStorage();
    mockGetEncryptionKey.mockRejectedValueOnce(new Error('Keychain unavailable'));

    await expect(
      storage.setItem('STELLAR_SECRET_KEY_1', 'secret'),
    ).rejects.toThrow('Keychain unavailable');
    expect(defaultStore().has('STELLAR_SECRET_KEY_1')).toBe(false);
  });
});
