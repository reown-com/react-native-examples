jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: { info: jest.fn() },
}));

jest.mock('../src/utils/WalletKitUtil', () => ({ walletKit: {} }));

jest.mock('../src/utils/TonWalletUtil', () => ({
  getWallet: jest.fn(async () => ({
    getPublicKey: () => 'ton-pubkey',
    getStateInit: () => 'ton-state-init',
  })),
}));

import { WALLET_GUIDE_ID } from '../src/utils/misc';
import {
  buildPickerSessionProperties,
  getOrigin,
  isPickerPairing,
  isSameOrigin,
  PICKER_DAPPS,
  registerPickerPairing,
} from '../src/utils/PickerUtil';

describe('origin check', () => {
  it('normalizes scheme, host case and default ports', () => {
    expect(getOrigin('https://React-App.walletconnect.com/x?y#z')).toBe(
      'https://react-app.walletconnect.com',
    );
    expect(getOrigin('https://app.walletconnect.com:443/stake')).toBe(
      'https://app.walletconnect.com',
    );
    expect(getOrigin('http://10.0.2.2:3000/')).toBe('http://10.0.2.2:3000');
    expect(getOrigin('wc:abc@2?relay-protocol=irn')).toBeUndefined();
  });

  it('rejects other origins and look-alike hosts', () => {
    const origin = 'https://app.walletconnect.com';
    expect(isSameOrigin('https://app.walletconnect.com/stake', origin)).toBe(
      true,
    );
    expect(isSameOrigin('https://evil.com/', origin)).toBe(false);
    expect(
      isSameOrigin('https://app.walletconnect.com.evil.com/', origin),
    ).toBe(false);
    expect(
      isSameOrigin('https://app.walletconnect.com@evil.com/', origin),
    ).toBe(false);
    expect(isSameOrigin('http://app.walletconnect.com/', origin)).toBe(false);
  });
});

describe('picker pairing topics', () => {
  it('only recognizes registered topics', () => {
    registerPickerPairing('wc:abc123@2?relay-protocol=irn&symKey=k');
    expect(isPickerPairing('abc123')).toBe(true);
    expect(isPickerPairing('def456')).toBe(false);
    expect(isPickerPairing(undefined)).toBe(false);
  });
});

describe('PICKER_DAPPS', () => {
  // DappBrowser only injects the bridge when the tile URL has an origin.
  it.each(PICKER_DAPPS.map(dapp => [dapp.name, dapp.url]))(
    '%s has an https origin',
    (_name, url) => {
      expect(getOrigin(url)).toMatch(/^https:\/\/[^/]+$/);
    },
  );
});

describe('buildPickerSessionProperties', () => {
  it('merges wallet_guide_id with the TON properties', async () => {
    expect(await buildPickerSessionProperties({ ton: {} })).toEqual({
      ton_getPublicKey: 'ton-pubkey',
      ton_getStateInit: 'ton-state-init',
      wallet_guide_id: WALLET_GUIDE_ID,
    });
  });
});
