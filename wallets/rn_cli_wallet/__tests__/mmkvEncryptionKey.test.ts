const mockSecureStoreGet = jest.fn();
const mockSecureStoreSet = jest.fn();
let mockTestMode: string | undefined;

jest.mock('expo-secure-store', () => ({
  getItemAsync: mockSecureStoreGet,
  setItemAsync: mockSecureStoreSet,
}));

jest.mock('../src/utils/env', () => ({
  ENV: { TEST_MODE: mockTestMode },
}));

function loadGetEncryptionKey() {
  let result: typeof import('../src/utils/mmkvEncryptionKey').getEncryptionKey;
  jest.isolateModules(() => {
    result = (
      require('../src/utils/mmkvEncryptionKey') as typeof import('../src/utils/mmkvEncryptionKey')
    ).getEncryptionKey;
  });
  return result!;
}

describe('MMKV encryption key', () => {
  beforeEach(() => {
    mockSecureStoreGet.mockReset();
    mockSecureStoreSet.mockReset();
    mockTestMode = undefined;
  });

  it('reuses an existing Keychain key', async () => {
    mockSecureStoreGet.mockResolvedValue('existing-key');

    await expect(loadGetEncryptionKey()()).resolves.toBe('existing-key');
    expect(mockSecureStoreSet).not.toHaveBeenCalled();
  });

  it('generates and persists a valid MMKV key on first use', async () => {
    mockSecureStoreGet.mockResolvedValue(null);
    mockSecureStoreSet.mockResolvedValue(undefined);

    const key = await loadGetEncryptionKey()();

    expect(key).toHaveLength(16);
    expect(mockSecureStoreSet).toHaveBeenCalledWith(
      'mmkv_encryption_key',
      key,
    );
  });

  it('fails closed when Keychain is unavailable in a normal build', async () => {
    mockSecureStoreGet.mockRejectedValue(new Error('missing entitlement'));

    await expect(loadGetEncryptionKey()()).rejects.toThrow(
      'refusing to access wallet secrets: missing entitlement',
    );
  });

  it('does not replace a missing key when encrypted wallet data exists', async () => {
    mockSecureStoreGet.mockResolvedValue(null);

    await expect(loadGetEncryptionKey()(true)).rejects.toThrow(
      'the encryption key is missing for existing wallet data',
    );
    expect(mockSecureStoreSet).not.toHaveBeenCalled();
  });

  it('uses an encrypted disposable store only in explicit E2E mode', async () => {
    mockTestMode = 'true';
    mockSecureStoreGet.mockRejectedValue(new Error('missing entitlement'));

    await expect(loadGetEncryptionKey()()).resolves.toBe('wallet-e2e-key!!');
    expect(mockSecureStoreGet).not.toHaveBeenCalled();
  });
});
