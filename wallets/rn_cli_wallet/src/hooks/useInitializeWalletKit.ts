import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { createWalletKit, walletKit } from '@/utils/WalletKitUtil';
import {
  ensureWalletReady,
  hydrateCachedWalletAddresses,
} from '@/utils/WalletInitializationUtil';

export default function useInitializeWalletKit() {
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef<string>('');

  const { relayerRegionURL } = useSnapshot(SettingsStore.state);

  const onInitialize = useCallback(async () => {
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

  return initialized;
}
