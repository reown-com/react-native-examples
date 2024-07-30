import {useCallback, useEffect, useState} from 'react';
import {useAccount} from 'wagmi';
import SettingsStore from '@/stores/SettingsStore';

export function useLogs() {
  const {connector} = useAccount();
  const [provider, setProvider] = useState<any>(null);

  const getLogs = useCallback(async () => {
    if (provider?.signer?.client?.core) {
      const _logs =
        await provider.signer?.client.core.logChunkController?.getLogArray();
      SettingsStore.setLogs(_logs ? _logs.reverse() : []);
    }
  }, [provider]);

  useEffect(() => {
    const getProvider = async () => {
      if (connector && connector?.getProvider) {
        const _provider = await connector?.getProvider();
        setProvider(_provider);
      }
    };

    getProvider();
  }, [connector]);

  useEffect(() => {
    const interval = setInterval(() => {
      getLogs();
    }, 1000);

    return () => clearTimeout(interval);
  }, [getLogs]);
}
