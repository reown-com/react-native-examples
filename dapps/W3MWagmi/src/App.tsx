
import 'text-encoding';
import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {createAppKit, AppKit, bitcoin, AppKitProvider, solana} from '@reown/appkit-react-native';
import {WagmiAdapter} from '@reown/appkit-wagmi-react-native';
import {SolanaAdapter, PhantomConnector} from '@reown/appkit-solana-react-native';
import {BitcoinAdapter} from '@reown/appkit-bitcoin-react-native';
// import {EthersAdapter} from '@reown/appkit-ethers-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import Toast from 'react-native-toast-message';
import Config from 'react-native-config';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {getCustomWallets, getMetadata} from '@/utils/misc';
import {RootStackNavigator} from '@/navigators/RootStackNavigator';
import {chains} from '@/utils/WagmiUtils';
import SettingsStore from '@/stores/SettingsStore';
import { WagmiProvider } from 'wagmi';
import { Chain } from 'viem';
import { storage } from './utils/StorageUtil';
import { siweConfig } from './utils/SiweUtils';

Sentry.init({
  enabled: !__DEV__ && !!Config.ENV_SENTRY_DSN,
  dsn: Config.ENV_SENTRY_DSN,
  environment: Config.ENV_SENTRY_TAG,
  _experiments: {
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  },
  tracesSampleRate: 0.5,
  profilesSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],
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

// const ethersAdapter = new EthersAdapter({
//   projectId,
// });

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: chains as [Chain, ...Chain[]],
});

const solanaAdapter = new SolanaAdapter({
  projectId,
});

const bitcoinAdapter = new BitcoinAdapter({
  projectId,
});

const adapters = [wagmiAdapter, bitcoinAdapter, solanaAdapter];

const networks = [...chains, solana, bitcoin];

// 3. Create modal
const appKit = createAppKit({
  projectId,
  // wagmiConfig,
  adapters,
  metadata,
  networks,
  siweConfig,
  clipboardClient,
  storage,
  extraConnectors: [new PhantomConnector({})],
  customWallets: getCustomWallets(),
});

const queryClient = new QueryClient();

function App(): JSX.Element {
  // 4. Handle deeplinks for Coinbase SDK + WalletConnect Link Mode
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      // const handledBySdk = handleResponse(new URL(url));
      const handledBySdk = false;
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
  );
}

export default Sentry.wrap(App);
