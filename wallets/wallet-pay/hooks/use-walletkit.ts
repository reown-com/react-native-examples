import '@walletconnect/react-native-compat';

import { storage } from '@/utils/storage';
import { IWalletKit, WalletKit, WalletKitTypes } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { useEffect, useRef, useState } from 'react';

const core = new Core({
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  customStoragePrefix: '@walletconnect/expo-wallet',
  storage,
});

let walletKit: IWalletKit | undefined;
const stateListeners = new Set<(value: boolean) => void>();

export function useInitializeWalletKit() {
  useEffect(() => {
    async function init() {
      if (!walletKit) {
        walletKit = await WalletKit.init({
          core,
          metadata: {
            name: 'Expo Wallet',
            description: 'Expo Wallet to interface with Dapps',
            url: 'https://walletconnect.com',
            icons: ['https://your_wallet_icon.png'],
            redirect: {
              native: 'yourwalletscheme://',
            },
          },
        });
        console.log('WalletKit initialized');

        stateListeners.forEach((listener) => listener(true));
      }
    }
    init();
  }, []);
}

export function useWalletKit() {
  const [isInitialized, setIsInitialized] = useState(!!walletKit);

  useEffect(() => {
    if (walletKit) {
      setIsInitialized(true);
    } else {
      stateListeners.add(setIsInitialized);
    }

    return () => {
      stateListeners.delete(setIsInitialized);
    };
  }, []);

  return { walletKit, isInitialized };
}

export function useWalletKitListener<E extends WalletKitTypes.Event>(
  event: E,
  listener: (args: WalletKitTypes.EventArguments[E]) => void,
) {
  const { isInitialized } = useWalletKit();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const stableListener = (args: WalletKitTypes.EventArguments[E]) => {
      listenerRef.current(args);
    };

    if (isInitialized) {
      walletKit?.on(event, stableListener);
      console.log('useWalletKitListener on', event, stableListener);
    }

    return () => {
      walletKit?.off(event, stableListener);
    };
  }, [event, isInitialized]);
}
