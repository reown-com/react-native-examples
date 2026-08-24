const mockValues = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class {
    getString(key: string) {
      return mockValues.get(key);
    }
    set(key: string, value: string) {
      mockValues.set(key, value);
    }
    delete(key: string) {
      mockValues.delete(key);
    }
    getAllKeys() {
      return Array.from(mockValues.keys());
    }
  },
}));

import {
  getWalletAddressCache,
  updateWalletAddressCache,
  WALLET_ADDRESS_CACHE_KEY,
} from '../src/utils/WalletAddressCache';

describe('WalletAddressCache', () => {
  beforeEach(() => {
    mockValues.clear();
  });

  it('serializes concurrent public-address updates without dropping fields', async () => {
    await Promise.all([
      updateWalletAddressCache({ eip155Address: '0xeip155' }),
      updateWalletAddressCache({ suiAddress: '0xsui' }),
      updateWalletAddressCache({
        bitcoinAddresses: ['bc1payment', 'bc1taproot'],
      }),
    ]);

    await expect(getWalletAddressCache()).resolves.toEqual({
      version: 1,
      eip155Address: '0xeip155',
      suiAddress: '0xsui',
      bitcoinAddresses: ['bc1payment', 'bc1taproot'],
    });
  });

  it('ignores an incompatible cache schema', async () => {
    mockValues.set(WALLET_ADDRESS_CACHE_KEY, JSON.stringify({ version: 0 }));

    await expect(getWalletAddressCache()).resolves.toBeNull();
  });
});
