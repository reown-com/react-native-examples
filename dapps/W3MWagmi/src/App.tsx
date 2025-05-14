
import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {createAppKit, AppKit, solana, bitcoin, AppKitProvider} from '@reown/appkit-react-native';
// import {WagmiAdapter} from '@reown/appkit-wagmi-react-native';
import {SolanaAdapter} from '@reown/appkit-solana-react-native';
import {BitcoinAdapter} from '@reown/appkit-bitcoin-react-native';
import {EthersAdapter} from '@reown/appkit-ethers-react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// import {coinbaseConnector} from '@reown/appkit-coinbase-wagmi-react-native';
// import {authConnector} from '@reown/appkit-auth-wagmi-react-native';
// import {handleResponse} from '@coinbase/wallet-mobile-sdk';
// import {WagmiProvider} from 'wagmi';
import Toast from 'react-native-toast-message';
import Config from 'react-native-config';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {getMetadata} from '@/utils/misc';
import {RootStackNavigator} from '@/navigators/RootStackNavigator';
// import {siweConfig} from '@/utils/SiweUtils';
import {chains} from '@/utils/WagmiUtils';
import SettingsStore from '@/stores/SettingsStore';
// import { Chain } from 'viem';

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

// Removed coinbase connector for now, as it's not compatible with React Native New Architecture
// const _coinbaseConnector = coinbaseConnector({
//   redirect: metadata?.redirect?.universal || '',
// });

// const _authConnector = authConnector({
//   projectId,
//   metadata,
// });

// const wagmiConfig = defaultWagmiConfig({
//   chains,
//   projectId,
//   metadata,
//   // extraConnectors: [
//   //   // _coinbaseConnector,
//   //   _authConnector],
// });

const ethersAdapter = new EthersAdapter({
  projectId,
});

// const wagmiAdapter = new WagmiAdapter({
//   projectId,
//   networks: chains as [Chain, ...Chain[]],
// });

const solanaAdapter = new SolanaAdapter({
  projectId,
});

const bitcoinAdapter = new BitcoinAdapter({
  projectId,
});

const adapters = [ethersAdapter, bitcoinAdapter, solanaAdapter];

const networks = [...chains, solana, bitcoin];

// const customWallets = getCustomWallets();

// 3. Create modal
const appKit = createAppKit({
  projectId,
  // wagmiConfig,
  adapters,
  metadata,
  networks,
  // siweConfig,
  clipboardClient,
  // customWallets,
  // connectorImages: {
  //   coinbaseWallet:
  //     'https://play-lh.googleusercontent.com/wrgUujbq5kbn4Wd4tzyhQnxOXkjiGqq39N4zBvCHmxpIiKcZw_Pb065KTWWlnoejsg',
  //   appKitAuth: 'https://avatars.githubusercontent.com/u/179229932',
  // },
  // features: {
  //   email: true,
  //   socials: ['x', 'discord', 'apple'],
  //   emailShowWallets: true,
  //   swaps: true,
  // },
});

const queryClient = new QueryClient();

function App(): JSX.Element {
  // 4. Handle deeplinks for Coinbase SDK
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      // const handledBySdk = handleResponse(new URL(url));
      const handledBySdk = false;
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
        {/* <WagmiProvider config={wagmiAdapter.wagmiConfig}> */}
          <AppKitProvider instance={appKit}>
            <QueryClientProvider client={queryClient}>
              <RootStackNavigator />
              <Toast />
              <AppKit />
            </QueryClientProvider>
          </AppKitProvider>
        {/* </WagmiProvider> */}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
