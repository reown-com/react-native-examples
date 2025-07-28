import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking, SafeAreaView, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  createAppKit,
  defaultConfig,
  AppKitButton,
  AppKit,
} from '@reown/appkit-ethers-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {CoinbaseProvider} from '@reown/appkit-coinbase-ethers-react-native';
import {AuthProvider} from '@reown/appkit-auth-ethers-react-native';
import {ENV_PROJECT_ID} from '@env';
import {MMKV} from 'react-native-mmkv';

import {SignMessage} from './views/SignMessage';
import {SendTransaction} from './views/SendTransaction';
import {ReadContract} from './views/ReadContract';
import {WriteContract} from './views/WriteContract';
import {SignTypedDataV4} from './views/SignTypedDataV4';
import {mainnet, polygon} from './utils/ChainUtils';
import {siweConfig} from './utils/SiweUtils';

// 1. Get projectId at https://cloud.reown.com
const projectId = ENV_PROJECT_ID;

// 2. Define your chains
const chains = [mainnet, polygon];

// 3. Create config
const metadata = {
  name: 'AppKit Ethers',
  description: 'AppKit with Ethers',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'rn-w3m-ethers-sample://',
  },
};

const coinbaseProvider = new CoinbaseProvider({
  redirect: 'rn-w3m-ethers-sample://',
  rpcUrl: mainnet.rpcUrl,
  storage: new MMKV(),
});

const auth = new AuthProvider({projectId, metadata});

const config = defaultConfig({
  metadata,
  extraConnectors: [coinbaseProvider, auth],
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
      'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
    mobile_link: 'rn-web3wallet://',
  },
];

// 3. Create modal
createAppKit({
  projectId,
  metadata,
  chains,
  config,
  siweConfig,
  customWallets,
  clipboardClient,
  enableAnalytics: true,
  features: {
    swaps: true,
    onramp: true,
  },
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
        AppKit + ethers
      </Text>
      <FlexView style={styles.buttonContainer}>
        <AppKitButton balance="show" />
        <SignMessage />
        <SendTransaction />
        <SignTypedDataV4 />
        <ReadContract />
        <WriteContract />
      </FlexView>
      <AppKit />
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
