import {useCallback, useEffect} from 'react';
import SettingsStore from '@/store/SettingsStore';
import {web3wallet} from '@/utils/WalletConnectUtil';

export function useLogs() {
  const getLogs = useCallback(async () => {
    if (web3wallet) {
      // @ts-ignore
      const _logs = await web3wallet.core.logChunkController?.getLogArray();
      SettingsStore.setLogs(_logs.reverse());
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getLogs();
    }, 1000);

    return () => clearTimeout(interval);
  }, [getLogs]);
}
