// Regression test for the ethers v6 + valtio interaction: setWallet() must
// ref() the wallet, else valtio's proxy corrupts ethers v6's private
// #signingKey and breaks signing from the shared eip155Wallets instance.

// SettingsStore transitively pulls in react-native-mmkv (native). Stub it.
jest.mock('react-native-mmkv', () => ({
  MMKV: class {
    getString() {
      return undefined;
    }
    set() {}
    delete() {}
    getAllKeys() {
      return [];
    }
  },
}));

import EIP155Lib from '../src/lib/EIP155Lib';
import SettingsStore from '../src/store/SettingsStore';

const TYPED_DATA = {
  domain: {
    name: 'Test',
    version: '1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000001',
  },
  types: { Msg: [{ name: 'value', type: 'string' }] },
  message: { value: 'hello' },
};

describe('SettingsStore wallet storage (ethers v6 + valtio)', () => {
  it('keeps the EVM wallet usable for signing after setWallet()', async () => {
    const lib = EIP155Lib.init({});

    // Mirrors useInitializeWalletKit: the same instance lives in the
    // eip155Wallets map AND is stored in SettingsStore.
    SettingsStore.setWallet(lib);

    // PaymentStore signs using the instance from the raw map. Without ref()
    // this throws "Cannot read private member #signingKey".
    const signature = await lib._signTypedData(
      TYPED_DATA.domain,
      TYPED_DATA.types,
      TYPED_DATA.message,
    );

    expect(signature).toMatch(/^0x[0-9a-fA-F]+$/);
  });
});
