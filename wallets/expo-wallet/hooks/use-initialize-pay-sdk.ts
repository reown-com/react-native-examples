/**
 * Hook to initialize the WalletConnect Pay SDK
 *
 * Quick Start:
 * 1. Call this hook once in your root layout
 * 2. Set EXPO_PUBLIC_PROJECT_ID and EXPO_PUBLIC_PAY_API_KEY in .env
 *
 * ```tsx
 * // app/_layout.tsx
 * export default function RootLayout() {
 *   useInitializePaySDK();
 *   return <Stack />;
 * }
 * ```
 *
 * Note: This uses Expo's Constants API. For non-Expo apps, replace
 * Constants.expoConfig with your app's config access pattern.
 */

import { useEffect, useState } from 'react';
import Constants from 'expo-constants';

import PayStore from '@/stores/use-pay-store';

const PAY_CONFIG = {
  projectId:
    Constants.expoConfig?.extra?.projectId ||
    process.env.EXPO_PUBLIC_PROJECT_ID ||
    '',
  apiKey: process.env.EXPO_PUBLIC_PAY_API_KEY || '',
  metadata: {
    name: 'Expo Wallet',
    bundleId:
      Constants.expoConfig?.ios?.bundleIdentifier ||
      'com.walletconnect.expo-wallet',
  },
};

export function useInitializePaySDK() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      return;
    }

    if (!PAY_CONFIG.projectId || !PAY_CONFIG.apiKey) {
      if (__DEV__) {
        console.warn(
          '[Pay] Missing projectId or apiKey - Pay SDK will not be initialized',
        );
      }
      return;
    }

    PayStore.initialize(PAY_CONFIG);
    setInitialized(PayStore.isAvailable());

    if (__DEV__) {
      console.log(
        '[Pay] SDK initialization complete, available:',
        PayStore.isAvailable(),
      );
    }
  }, [initialized]);

  return initialized;
}
