jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn() },
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
    setWalletReadiness: jest.fn(),
  },
}));

import {
  startBackgroundWalletRestoration,
  WALLET_NAMESPACES,
} from '../src/utils/WalletInitializationUtil';

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
  });

  afterAll(() => {
    globalThis.requestIdleCallback = originalRequestIdleCallback;
  });

  afterEach(() => {
    jest.useRealTimers();
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
