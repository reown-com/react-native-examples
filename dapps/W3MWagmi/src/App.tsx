import '@walletconnect/react-native-compat';
import React, {useEffect} from 'react';
import {
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
  W3mButton,
} from '@web3modal/wagmi-react-native';

import {CoinbaseConnector} from '@web3modal/coinbase-wagmi-react-native';
import {FlexView, Text} from '@web3modal/ui-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';

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
import {SignMessage} from './views/SignMessage';
import {SendTransaction} from './views/SendTransaction';
import {ReadContract} from './views/ReadContract';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {WriteContract} from './views/WriteContract';
import {getCustomWallets} from './utils/misc';
import {SignTypedDataV4} from './views/SignTypedDataV4';

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
  const isDarkMode = useColorScheme() === 'dark';

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
    <WagmiConfig config={wagmiConfig}>
      <SafeAreaView style={[styles.container, isDarkMode && styles.dark]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Text style={styles.title} variant="large-600">
          Web3Modal + wagmi
        </Text>
        <FlexView style={styles.buttonContainer}>
          <W3mButton balance="show" />
          <SignMessage />
          <SendTransaction />
          <SignTypedDataV4 />
          <ReadContract />
          <WriteContract />
        </FlexView>
      </SafeAreaView>
      <Web3Modal />
    </WagmiConfig>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    gap: 8,
  },
  dark: {
    backgroundColor: '#141414',
  },
  title: {
    marginBottom: 40,
    fontSize: 30,
  },
});

export default App;
