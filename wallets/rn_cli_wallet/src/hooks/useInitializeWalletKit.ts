import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import * as Sentry from '@sentry/react-native';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { createWalletKit, walletKit } from '@/utils/WalletKitUtil';

const MAX_INIT_ATTEMPTS = 3;
const INIT_RETRY_BASE_DELAY_MS = 1500;

export default function useInitializeWalletKit() {
  const [initialized, setInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(
    null,
  );
  const [retryGeneration, setRetryGeneration] = useState(0);
  const prevRelayerURLValue = useRef<string>('');

  const { relayerRegionURL } = useSnapshot(SettingsStore.state);

  useEffect(() => {
    if (initialized) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const onInitialize = async () => {
      attempt += 1;

      try {
        await createWalletKit(relayerRegionURL);
        if (cancelled) return;

        setInitializationError(null);
        prevRelayerURLValue.current = relayerRegionURL;
        setInitialized(true);
        SettingsStore.state.initPromiseResolver?.resolve(undefined);
      } catch (err: unknown) {
        if (cancelled) return;

        const error = err instanceof Error ? err : new Error(String(err));
        LogStore.error(
          `Failed to initialize WalletKit: ${error.message}`,
          'Initialization',
          'onInitialize',
          { attempt, error: String(err) },
        );

        if (attempt < MAX_INIT_ATTEMPTS) {
          const delay = INIT_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
          retryTimer = setTimeout(onInitialize, delay);
          return;
        }

        setInitializationError(error);
        // `initPromise` represents initialization settling. Wake any deep-link
        // flow so it can show its normal unavailable-state error instead of
        // awaiting forever.
        SettingsStore.state.initPromiseResolver?.resolve(undefined);
        Sentry.captureException(error, {
          tags: { area: 'Initialization', op: 'onInitialize' },
          extra: { attempts: attempt },
        });
      }
    };

    onInitialize();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [initialized, relayerRegionURL, retryGeneration]);

  const retryInitialization = useCallback(() => {
    setInitializationError(null);
    setRetryGeneration(value => value + 1);
  }, []);

  // restart transport if relayer region changes
  const onRelayerRegionChange = useCallback(() => {
    try {
      walletKit.core.relayer.restartTransport(relayerRegionURL);
      prevRelayerURLValue.current = relayerRegionURL;
    } catch (err: unknown) {
      LogStore.error(
        `Failed to restart relayer transport: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        'Initialization',
        'onRelayerRegionChange',
        { error: String(err) },
      );
    }
  }, [relayerRegionURL]);

  useEffect(() => {
    if (initialized && prevRelayerURLValue.current !== relayerRegionURL) {
      onRelayerRegionChange();
    }
  }, [initialized, relayerRegionURL, onRelayerRegionChange]);

  return { initialized, initializationError, retryInitialization };
}
