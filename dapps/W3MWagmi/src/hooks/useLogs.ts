import {useCallback, useEffect} from 'react';
import SettingsStore from '@/stores/SettingsStore';
import { useProvider } from '@reown/appkit-react-native';

export function useLogs() {
  const { provider } = useProvider();

  const getLogs = useCallback(async () => {
    // @ts-ignore
    if (provider?.client?.core) {
      const _logs =
      // @ts-ignore
        await provider?.client?.core.logChunkController?.getLogArray();
      SettingsStore.setLogs(_logs ? _logs.reverse() : []);
    }
  }, [provider]);

  useEffect(() => {
    const interval = setInterval(() => {
      getLogs();
    }, 1000);

    return () => clearTimeout(interval);
  }, [getLogs]);
}
