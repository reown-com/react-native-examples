jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../src/store/SettingsStore', () => ({
  __esModule: true,
  default: {
    state: {
      walletReadiness: {
        eip155: 'ready',
        sui: 'ready',
        ton: 'ready',
        tron: 'ready',
        canton: 'ready',
        solana: 'ready',
        bip122: 'ready',
        stellar: 'ready',
      },
    },
    setEIP155Address: jest.fn(),
    setWallet: jest.fn(),
    setWalletReadiness: jest.fn(),
  },
}));

jest.mock('../src/utils/EIP155WalletUtil', () => ({
  createOrRestoreEIP155Wallet: jest.fn(),
}));

import {
  ensureWalletReady,
  startBackgroundWalletRestoration,
  WALLET_NAMESPACES,
} from '../src/utils/WalletInitializationUtil';
import SettingsStore from '../src/store/SettingsStore';
import { createOrRestoreEIP155Wallet } from '../src/utils/EIP155WalletUtil';

const mockedCreateOrRestoreEIP155Wallet = jest.mocked(
  createOrRestoreEIP155Wallet,
);

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('background wallet restoration', () => {
  const idleCallbacks: IdleRequestCallback[] = [];
  const originalRequestIdleCallback = globalThis.requestIdleCallback;

  beforeAll(() => {
    globalThis.requestIdleCallback = jest.fn(callback => {
      idleCallbacks.push(callback);
      return idleCallbacks.length;
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
    idleCallbacks.length = 0;
    for (const namespace of WALLET_NAMESPACES) {
      SettingsStore.state.walletReadiness[namespace] = 'ready';
    }
    jest.clearAllMocks();
  });

  afterAll(() => {
    globalThis.requestIdleCallback = originalRequestIdleCallback;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the wallet map returned after the lazy EIP155 module initializes', async () => {
    const wallet = { getAddress: jest.fn() };
    mockedCreateOrRestoreEIP155Wallet.mockResolvedValue({
      eip155Addresses: ['0xabc'],
      eip155Wallets: { '0xabc': wallet } as never,
    });
    SettingsStore.state.walletReadiness.eip155 = 'idle';

    await ensureWalletReady('eip155');

    expect(SettingsStore.setEIP155Address).toHaveBeenCalledWith('0xabc');
    expect(SettingsStore.setWallet).toHaveBeenCalledWith(wallet);
  });

  it('waits for the startup grace period and schedules one namespace per idle turn', async () => {
    startBackgroundWalletRestoration();

    expect(idleCallbacks).toHaveLength(0);
    jest.advanceTimersByTime(749);
    expect(idleCallbacks).toHaveLength(0);
    jest.advanceTimersByTime(1);
    expect(idleCallbacks).toHaveLength(1);

    for (let index = 0; index < WALLET_NAMESPACES.length; index += 1) {
      const callback = idleCallbacks.shift();
      expect(callback).toBeDefined();
      callback?.({ didTimeout: false, timeRemaining: () => 50 });
      await flushPromises();

      expect(idleCallbacks).toHaveLength(
        index === WALLET_NAMESPACES.length - 1 ? 0 : 1,
      );
    }
  });
});
