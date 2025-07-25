import 'text-encoding'; //needed for solana web3js
import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking, SafeAreaView, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {MMKV} from 'react-native-mmkv';

import {
  createAppKit,
  AppKitButton,
  AppKit,
  AppKitProvider,
  solana,
  bitcoin,
} from '@reown/appkit-react-native';
import {
  SolanaAdapter,
  PhantomConnector,
} from '@reown/appkit-solana-react-native';
import {BitcoinAdapter} from '@reown/appkit-bitcoin-react-native';
import {CoinbaseConnector} from '@reown/appkit-coinbase-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';
import {EthersAdapter} from '@reown/appkit-ethers-react-native';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {ENV_PROJECT_ID} from '@env';

import {mainnet, polygon} from './utils/ChainUtils';
import {siweConfig} from './utils/SiweUtils';
import {storage} from './utils/StorageUtil';
import {ActionsView} from './views/ActionsView';

// 1. Get projectId at https://cloud.reown.com
const projectId = ENV_PROJECT_ID;

// 2. Define your chains
const networks = [mainnet, polygon, solana, bitcoin];

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

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const ethersAdapter = new EthersAdapter({
  projectId,
});

const solanaAdapter = new SolanaAdapter({
  projectId,
});

const bitcoinAdapter = new BitcoinAdapter({
  projectId,
});

const adapters = [ethersAdapter, solanaAdapter, bitcoinAdapter];

// 3. Create modal
const appKit = createAppKit({
  projectId,
  metadata,
  networks,
  adapters,
  storage,
  siweConfig,
  clipboardClient,
  enableAnalytics: true,
  extraConnectors: [
    new PhantomConnector({cluster: 'mainnet-beta'}),
    new CoinbaseConnector({storage: new MMKV()}),
  ],
  features: {
    swaps: true,
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
      <AppKitProvider instance={appKit}>
        <Text style={styles.title} variant="large-600">
          AppKit + ethers
        </Text>
        <FlexView style={styles.buttonContainer}>
          <AppKitButton balance="show" />
          <ActionsView />
        </FlexView>
        <AppKit />
      </AppKitProvider>
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
