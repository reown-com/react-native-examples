// Regression test for the ethers v6 + valtio interaction.
//
// ethers v6 wallets store the key in a private #signingKey field. valtio's
// proxy() not only breaks private-field access when the wallet is read back
// through the proxy, it also rewrites nested object properties on the target —
// so an EIP155Lib stored in SettingsStore without ref() would corrupt the same
// instance held in the eip155Wallets map, making PaymentStore's signing throw
// "Cannot read private member #signingKey". SettingsStore wraps wallets in
// ref() to prevent this.

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
