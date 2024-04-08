import '@walletconnect/react-native-compat';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from '@web3modal/wagmi-react-native';

import {CoinbaseConnector} from '@web3modal/coinbase-wagmi-react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';
import {NavigationContainer} from '@react-navigation/native';

import {WagmiConfig} from 'wagmi';
import {
  arbitrum,
  mainnet,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
} from 'wagmi/chains';
import Config from 'react-native-config';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {getCustomWallets} from './utils/misc';
import {RootStackNavigator} from './navigators/RootStackNavigator';

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
  name: 'Web3Modal + wagmi',
  description: 'Web3Modal + wagmi',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'w3mwagmisample://',
  },
};

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const chains = [
  mainnet,
  polygon,
  arbitrum,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
];

const coinbaseConnector = new CoinbaseConnector({
  chains,
  options: {
    redirect: metadata?.redirect?.native || '',
  },
});

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableEmail: true,
  extraConnectors: [coinbaseConnector],
});

const customWallets = getCustomWallets();

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  clipboardClient,
  customWallets,
  enableAnalytics: true,
});

function App(): JSX.Element {
  // 4. Handle deeplinks for Coinbase SDK
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      const handledBySdk = handleResponse(new URL(url));
      if (!handledBySdk) {
        // Handle other deeplinks
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer>
      <WagmiConfig config={wagmiConfig}>
        <RootStackNavigator />
        <Web3Modal />
      </WagmiConfig>
    </NavigationContainer>
  );
}

export default App;
