import 'text-encoding';
import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking, Platform} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {createAppKit, AppKit, AppKitProvider, ReownAuthentication} from '@reown/appkit-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import { WagmiProvider } from 'wagmi';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';
import Config from 'react-native-config';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {getMetadata, getEnvironment} from '@/utils/misc';
import {RootStackNavigator} from '@/navigators/RootStackNavigator';
import {buildNetworkConfig} from '@/utils/WagmiUtils';
import SettingsStore from '@/stores/SettingsStore';
import AppKitConfigStore from '@/stores/AppKitConfigStore';
import { storage } from './utils/StorageUtil';

Sentry.init({
  enabled: !__DEV__ && !!Config.ENV_SENTRY_DSN,
  dsn: Config.ENV_SENTRY_DSN,
  environment: getEnvironment(),
  sendDefaultPii: true,
  // Enable Logs
  enableLogs: true,

  // Temporarily disable native for Android, not sure why it's not working
  enableNative: Platform.OS === 'ios',

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  tracesSampleRate: 0.5,
  profilesSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// 1. Get projectId
const projectId = Config.ENV_PROJECT_ID;

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
  // SIWX (Sign In With X) is toggleable from the AppKit settings screen and
  // applied at launch (createAppKit is a singleton).
  ...(AppKitConfigStore.getSiwxEnabled() ? {siwx: new ReownAuthentication()} : {}),
  clipboardClient,
  debug: true,
  storage,
  extraConnectors,
});

const queryClient = new QueryClient();

function App(): JSX.Element {
  // 4. Handle deeplinks for Coinbase SDK + WalletConnect Link Mode
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      const handledBySdk = handleResponse(new URL(url));
      if (!handledBySdk) {
        // Handle WalletConnect Link Mode
        if (url.includes('wc_ev')) {
          SettingsStore.setCurrentRequestLinkMode(true);
        }
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Hide splashscreen
    BootSplash.hide({fade: true});

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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer>
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
  );
}

export default Sentry.wrap(App);
