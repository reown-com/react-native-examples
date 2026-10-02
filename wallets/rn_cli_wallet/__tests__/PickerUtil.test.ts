jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../src/utils/env', () => ({
  ENV: { WALLET_GUIDE_ID: 'guide-id' },
}));

jest.mock('../src/utils/WalletKitUtil', () => ({ walletKit: {} }));

jest.mock('../src/utils/TonWalletUtil', () => ({
  getWallet: jest.fn(async () => ({
    getPublicKey: () => 'ton-pubkey',
    getStateInit: () => 'ton-state-init',
  })),
}));

import LogStore from '../src/store/LogStore';
import { ENV } from '../src/utils/env';
import {
  buildPickerSessionProperties,
  getOrigin,
  isPickerPairing,
  isSameOrigin,
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

describe('buildPickerSessionProperties', () => {
  afterEach(() => {
    ENV.WALLET_GUIDE_ID = 'guide-id';
  });

  it('merges wallet_guide_id with the TON properties', async () => {
    expect(await buildPickerSessionProperties({ ton: {} })).toEqual({
      ton_getPublicKey: 'ton-pubkey',
      ton_getStateInit: 'ton-state-init',
      wallet_guide_id: 'guide-id',
    });
  });

  it('warns and omits wallet_guide_id when unset', async () => {
    ENV.WALLET_GUIDE_ID = undefined;
    expect(await buildPickerSessionProperties({})).toBeUndefined();
    expect(LogStore.warn).toHaveBeenCalled();
  });
});
