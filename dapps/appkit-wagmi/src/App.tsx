import 'text-encoding';

import React, {useEffect} from 'react';
import {Linking, Platform} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {createAppKit, AppKit, AppKitProvider, ReownAuthentication} from '@reown/appkit-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
// Coinbase Wallet SDK disabled on the Expo SDK 56 migration (Android native-module
// incompatibility with expo-modules-core@56). See src/utils/WagmiUtils.ts note.
// import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import { WagmiProvider } from 'wagmi';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {getMetadata, getEnvironment} from '@/utils/misc';
import {RootStackNavigator} from '@/navigators/RootStackNavigator';
import {buildNetworkConfig} from '@/utils/WagmiUtils';
import SettingsStore from '@/stores/SettingsStore';
import AppKitConfigStore from '@/stores/AppKitConfigStore';
import {DesktopFrameWrapper} from '@/components/DesktopFrameWrapper';
import { storage } from './utils/StorageUtil';

Sentry.init({
  enabled: !__DEV__ && !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: getEnvironment(),
  sendDefaultPii: false,
  enableLogs: __DEV__,

  // Native Sentry is disabled on Android pending investigation into an init
  // failure with the Expo SDK 56 / expo-modules-core@56 setup. Tracked upstream;
  // iOS native crash reporting is unaffected.
  enableNative: Platform.OS === 'ios',

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  tracesSampleRate: 0.5,
  profilesSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// 1. Get projectId
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? '';

// 2. Create config
const metadata = getMetadata();

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

// Build adapters/networks from the user's persisted per-chain selection.
// AppKit is a singleton, so this is applied once at launch (see NetworkSettings
// screen — changing the selection requires an app reload to take effect).
const {wagmiAdapter, adapters, networks, extraConnectors} = buildNetworkConfig(
  projectId,
  AppKitConfigStore.getEnabledNetworkIds(),
);

// 3. Create modal
const appKit = createAppKit({
  projectId,
  adapters,
  metadata,
  networks,
  ...(AppKitConfigStore.getSiwxEnabled() ? {siwx: new ReownAuthentication()} : {}),
  clipboardClient,
  debug: __DEV__,
  storage,
  extraConnectors,
});

const queryClient = new QueryClient();

function App(): JSX.Element {
  // 4. Handle deeplinks for WalletConnect Link Mode
  // (Coinbase SDK handleResponse temporarily removed — see import note above.)
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      // Handle WalletConnect Link Mode
      if (url.includes('wc_ev')) {
        SettingsStore.setCurrentRequestLinkMode(true);
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Hide splashscreen (native-only; no bootsplash on web)
    if (Platform.OS !== 'web') {
      BootSplash.hide({fade: true});
    }

    // Check if app was opened from a link-mode response
    async function checkInitialUrl() {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        SettingsStore.setCurrentRequestLinkMode(initialUrl.includes('wc_ev'));
      }
    }

    checkInitialUrl();
  }, []);

  return (
    <DesktopFrameWrapper>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <NavigationContainer
          documentTitle={{formatter: () => 'RN AppKit'}}>
            <WagmiProvider config={wagmiAdapter.wagmiConfig}>
              <AppKitProvider instance={appKit}>
                <QueryClientProvider client={queryClient}>
                  <RootStackNavigator />
                  <Toast />
                  <AppKit />
                </QueryClientProvider>
              </AppKitProvider>
            </WagmiProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </DesktopFrameWrapper>
  );
}

export default Sentry.wrap(App);
