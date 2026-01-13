import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  initNfc,
  isNfcEnabled,
  readNdefTag,
  cancelNfcScan,
  openNfcSettings,
} from '@/utils/NfcUtil';

interface UseNfcReaderResult {
  isSupported: boolean;
  isEnabled: boolean;
  isScanning: boolean;
  startScan: () => Promise<string | null>;
  stopScan: () => Promise<void>;
  openSettings: () => void;
}

export function useNfcReader(): UseNfcReaderResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    initNfc().then(setIsSupported);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const checkNfcStatus = () => {
      isNfcEnabled().then(setIsEnabled);
    };

    checkNfcStatus();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkNfcStatus();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isSupported]);

  const startScan = useCallback(async (): Promise<string | null> => {
    if (!isSupported || !isEnabled) {
      return null;
    }

    setIsScanning(true);
    try {
      const uri = await readNdefTag();
      return uri;
    } finally {
      setIsScanning(false);
    }
  }, [isSupported, isEnabled]);

  const stopScan = useCallback(async () => {
    await cancelNfcScan();
    setIsScanning(false);
  }, []);

  return {
    isSupported,
    isEnabled,
    isScanning,
    startScan,
    stopScan,
    openSettings: openNfcSettings,
  };
}
