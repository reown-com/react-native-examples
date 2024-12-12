import '@walletconnect/react-native-compat';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from '@reown/appkit-wagmi-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {coinbaseConnector} from '@reown/appkit-coinbase-wagmi-react-native';
import {authConnector} from '@reown/appkit-auth-wagmi-react-native';
import {WagmiProvider} from 'wagmi';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import Toast from 'react-native-toast-message';
import Config from 'react-native-config';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {getCustomWallets, getMetadata} from '@/utils/misc';
import {RootStackNavigator} from '@/navigators/RootStackNavigator';
import {siweConfig} from '@/utils/SiweUtils';
import {chains} from '@/utils/WagmiUtils';
import SettingsStore from '@/stores/SettingsStore';

if (!__DEV__ && Config.ENV_SENTRY_DSN) {
  Sentry.init({
    dsn: Config.ENV_SENTRY_DSN,
    environment: Config.ENV_SENTRY_TAG,
  });
}

// 1. Get projectId
const projectId = Config.ENV_PROJECT_ID;

// 2. Create config
const metadata = getMetadata();

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const _coinbaseConnector = coinbaseConnector({
  redirect: metadata?.redirect?.native || '',
});

const _authConnector = authConnector({
  projectId,
  metadata,
});

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [_coinbaseConnector, _authConnector],
});

const customWallets = getCustomWallets();

// 3. Create modal
createAppKit({
  projectId,
  wagmiConfig,
  metadata,
  siweConfig,
  clipboardClient,
  customWallets,
  features: {
    email: true,
    socials: ['x', 'apple', 'farcaster', 'discord'],
    emailShowWallets: true,
  },
});

const queryClient = new QueryClient();

function App(): JSX.Element {
  // 4. Handle deeplinks for Coinbase SDK
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      const handledBySdk = handleResponse(new URL(url));
      if (!handledBySdk) {
        // Handle other deeplinks
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
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RootStackNavigator />
            <Toast />
            <AppKit />
          </QueryClientProvider>
        </WagmiProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
