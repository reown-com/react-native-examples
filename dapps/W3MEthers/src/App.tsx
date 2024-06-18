import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking, SafeAreaView, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  createWeb3Modal,
  defaultConfig,
  W3mButton,
  Web3Modal,
} from '@web3modal/ethers-react-native';
import {FlexView, Text} from '@web3modal/ui-react-native';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {CoinbaseProvider} from '@web3modal/coinbase-ethers-react-native';
import {EmailProvider} from '@web3modal/email-ethers-react-native';
import {ENV_PROJECT_ID} from '@env';

import {SignMessage} from './views/SignMessage';
import {SendTransaction} from './views/SendTransaction';
import {ReadContract} from './views/ReadContract';
import {WriteContract} from './views/WriteContract';
import {SignTypedDataV4} from './views/SignTypedDataV4';
import {mainnet, polygon} from './utils/ChainUtils';
import {siweConfig} from './utils/SiweUtils';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = ENV_PROJECT_ID;

// 2. Define your chains
const chains = [mainnet, polygon];

// 3. Create config
const metadata = {
  name: 'W3M ethers',
  description: 'Web3Modal with Ethers',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'rn-w3m-ethers-sample://',
  },
};

const coinbaseProvider = new CoinbaseProvider({
  redirect: 'rn-w3m-ethers-sample://',
  rpcUrl: mainnet.rpcUrl,
});

const emailProvider = new EmailProvider({projectId, metadata});

const config = defaultConfig({
  metadata,
  extraConnectors: [coinbaseProvider, emailProvider],
});

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const customWallets = [
  {
    id: 'rn-wallet',
    name: 'RN Wallet',
    image_url:
      'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
    mobile_link: 'rn-web3wallet://',
  },
];

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  config,
  siweConfig,
  customWallets,
  clipboardClient,
  enableAnalytics: true,
});

function App(): React.JSX.Element {
  // Coinbase sdk setup
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} variant="large-600">
        Web3Modal + ethers
      </Text>
      <FlexView style={styles.buttonContainer}>
        <W3mButton balance="show" />
        <SignMessage />
        <SendTransaction />
        <SignTypedDataV4 />
        <ReadContract />
        <WriteContract />
      </FlexView>
      <Web3Modal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  title: {
    marginBottom: 40,
    fontSize: 30,
  },
});

export default App;
