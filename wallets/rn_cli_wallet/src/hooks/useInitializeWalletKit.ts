import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import * as Sentry from '@sentry/react-native';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { createWalletKit, walletKit } from '@/utils/WalletKitUtil';
import {
  ensureWalletReady,
  hydrateCachedWalletAddresses,
} from '@/utils/WalletInitializationUtil';

// Retry a failed init instead of leaving the splash gated forever. A first
// launch after an upgrade (empty address cache) restores EIP155 and inits
// WalletKit on the critical path; a single transient failure there used to
// require force-quitting the app. Retry with a small backoff so it self-heals.
const INIT_RETRY_DELAY_MS = 1500;

export default function useInitializeWalletKit() {
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef<string>('');
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { relayerRegionURL } = useSnapshot(SettingsStore.state);

  const onInitialize = useCallback(async () => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }

    try {
      const hasEip155Address = await hydrateCachedWalletAddresses();

      // A cache miss is a first launch after the upgrade (or a new install).
      // Restore just EIP155 to establish the minimum address needed by the app;
      // all remaining signers warm in the idle queue after first paint.
      if (!hasEip155Address) {
        await ensureWalletReady('eip155');
      }

      await createWalletKit(relayerRegionURL);
      setInitialized(true);
      SettingsStore.state.initPromiseResolver?.resolve(undefined);
    } catch (err: unknown) {
      LogStore.error(
        `Failed to initialize WalletKit: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        'Initialization',
        'onInitialize',
        { error: String(err) },
      );
      // Surface the exact failing step (the in-app log is hidden behind the
      // splash while init is pending, so route it to Sentry too).
      Sentry.captureException(
        err instanceof Error ? err : new Error(String(err)),
        { tags: { area: 'Initialization', op: 'onInitialize' } },
      );
      // Do not wedge the splash on a transient failure — retry.
      retryTimer.current = setTimeout(() => {
        onInitialize();
      }, INIT_RETRY_DELAY_MS);
    }
  }, [relayerRegionURL]);

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
    if (!initialized) {
      onInitialize();
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      onRelayerRegionChange();
    }
  }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange]);

  useEffect(
    () => () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    },
    [],
  );

  return initialized;
}
