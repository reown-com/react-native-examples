import {useCallback, useEffect, useRef, useState} from 'react';
import {useSnapshot} from 'valtio';

import SettingsStore from '@/store/SettingsStore';
import {createOrRestoreEIP155Wallet} from '@/utils/EIP155WalletUtil';
import {createWalletKit, walletKit} from '@/utils/WalletKitUtil';

export default function useInitializeWalletKit() {
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef<string>('');

  const {relayerRegionURL} = useSnapshot(SettingsStore.state);

  const onInitialize = useCallback(async () => {
    try {
      const {eip155Addresses, eip155Wallets} =
        await createOrRestoreEIP155Wallet();

      SettingsStore.setEIP155Address(eip155Addresses[0]);
      SettingsStore.setWallet(eip155Wallets[eip155Addresses[0]]);
      await createWalletKit(relayerRegionURL);
      setInitialized(true);
      SettingsStore.state.initPromiseResolver?.resolve(undefined);
    } catch (err: unknown) {
      console.log(err);
    }
  }, [relayerRegionURL]);

  // restart transport if relayer region changes
  const onRelayerRegionChange = useCallback(() => {
    try {
      walletKit.core.relayer.restartTransport(relayerRegionURL);
      prevRelayerURLValue.current = relayerRegionURL;
    } catch (err: unknown) {
      console.log(err);
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
