import { act, create, ReactTestRenderer } from 'react-test-renderer';

jest.mock('valtio', () => ({
  useSnapshot: (state: unknown) => state,
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

jest.mock('../src/store/SettingsStore', () => ({
  __esModule: true,
  default: {
    state: {
      relayerRegionURL: '',
      initPromiseResolver: { resolve: jest.fn() },
    },
  },
}));

jest.mock('../src/utils/WalletKitUtil', () => ({
  createWalletKit: jest.fn(),
  walletKit: {
    core: { relayer: { restartTransport: jest.fn() } },
  },
}));

import * as Sentry from '@sentry/react-native';
import useInitializeWalletKit from '../src/hooks/useInitializeWalletKit';
import SettingsStore from '../src/store/SettingsStore';
import { createWalletKit } from '../src/utils/WalletKitUtil';

const mockedCreateWalletKit = jest.mocked(createWalletKit);
const mockedCaptureException = jest.mocked(Sentry.captureException);
const mockedInitResolved = jest.mocked(
  SettingsStore.state.initPromiseResolver!.resolve,
);

type HookResult = ReturnType<typeof useInitializeWalletKit>;

let latestResult: HookResult | undefined;

function Harness() {
  latestResult = useInitializeWalletKit();
  return null;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('useInitializeWalletKit', () => {
  let renderer: ReactTestRenderer | undefined;

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    latestResult = undefined;
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => renderer?.unmount());
    }
    renderer = undefined;
    jest.useRealTimers();
  });

  it('fails once and retries only after an explicit action', async () => {
    mockedCreateWalletKit.mockRejectedValueOnce(new Error('relay unavailable'));

    await act(async () => {
      renderer = create(<Harness />);
      await flushPromises();
    });
    expect(mockedCreateWalletKit).toHaveBeenCalledTimes(1);
    expect(latestResult?.initializationError?.message).toBe(
      'relay unavailable',
    );
    expect(mockedCaptureException).toHaveBeenCalledTimes(1);
    expect(mockedInitResolved).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(30_000);
      await flushPromises();
    });
    expect(mockedCreateWalletKit).toHaveBeenCalledTimes(1);

    mockedCreateWalletKit.mockResolvedValueOnce(undefined);
    await act(async () => {
      latestResult?.retryInitialization();
      await flushPromises();
    });

    expect(mockedCreateWalletKit).toHaveBeenCalledTimes(2);
    expect(latestResult?.initialized).toBe(true);
    expect(latestResult?.initializationError).toBeNull();
  });
});
