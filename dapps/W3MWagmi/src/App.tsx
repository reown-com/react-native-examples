import '@walletconnect/react-native-compat';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from '@web3modal/wagmi-react-native';

import {coinbaseConnector} from '@web3modal/coinbase-wagmi-react-native';
import {emailConnector} from '@web3modal/email-wagmi-react-native';
import {WagmiProvider} from 'wagmi';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import Toast from 'react-native-toast-message';
import Config from 'react-native-config';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {getCustomWallets} from '@/utils/misc';
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
const metadata = {
  name: 'Appkit + wagmi',
  description: 'Appkit + wagmi',
  url: 'https://walletconnect.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'w3mwagmisample://',
    universal: 'https://lab.web3modal.com/appkit_rn',
    linkMode: true,
  },
};

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const _coinbaseConnector = coinbaseConnector({
  redirect: metadata?.redirect?.native || '',
});

const _emailConnector = emailConnector({
  projectId,
  metadata,
});

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [_coinbaseConnector, _emailConnector],
});

const customWallets = getCustomWallets();

// 3. Create modal
createWeb3Modal({
  projectId,
  wagmiConfig,
  metadata,
  siweConfig,
  clipboardClient,
  customWallets,
  enableAnalytics: true,
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
    <NavigationContainer>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RootStackNavigator />
          <Toast />
          <Web3Modal />
        </QueryClientProvider>
      </WagmiProvider>
    </NavigationContainer>
  );
}

export default App;
