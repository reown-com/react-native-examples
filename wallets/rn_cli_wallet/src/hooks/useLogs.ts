import {useCallback, useEffect} from 'react';
import SettingsStore from '@/store/SettingsStore';
import {walletKit} from '@/utils/WalletKitUtil';

export function useLogs() {
  const getLogs = useCallback(async () => {
    if (walletKit) {
      // @ts-ignore
      const _logs = await walletKit.core.logChunkController?.getLogArray();
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
