import 'text-encoding'; //needed for solana web3js
import '@walletconnect/react-native-compat';

import React, {useEffect} from 'react';
import {Linking, SafeAreaView, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {MMKV} from 'react-native-mmkv';
import Toast from 'react-native-toast-message';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {
  createAppKit,
  AppKitButton,
  AppKit,
  AppKitProvider,
  solana,
  bitcoin,
  NetworkButton,
} from '@reown/appkit-react-native';
import {
  SolanaAdapter,
  PhantomConnector,
  SolflareConnector,
} from '@reown/appkit-solana-react-native';
import {BitcoinAdapter} from '@reown/appkit-bitcoin-react-native';
import {CoinbaseConnector} from '@reown/appkit-coinbase-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';
import {EthersAdapter} from '@reown/appkit-ethers-react-native';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {ENV_PROJECT_ID} from '@env';

import {mainnet, polygon} from './utils/ChainUtils';
import {storage} from './utils/StorageUtil';
import {ActionsView} from './views/ActionsView';
import {WalletInfoView} from './views/WalletInfoView';

// 1. Get projectId at https://dashboard.reown.com
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

const adapters = [
  new EthersAdapter(),
  new SolanaAdapter(),
  new BitcoinAdapter(),
];

// 3. Create modal
const appKit = createAppKit({
  projectId,
  metadata,
  networks,
  adapters,
  storage,
  clipboardClient,
  enableAnalytics: true,
  extraConnectors: [
    new PhantomConnector(),
    new SolflareConnector(),
    new CoinbaseConnector({storage: new MMKV()}),
  ],
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <AppKitProvider instance={appKit}>
          <Text style={styles.title} variant="large-600">
            AppKit + ethers
          </Text>
          <FlexView style={styles.buttonContainer}>
            <WalletInfoView />
            <AppKitButton balance="show" />
            <NetworkButton />
            <ActionsView />
          </FlexView>
          <Toast />
          <AppKit />
        </AppKitProvider>
      </SafeAreaView>
    </SafeAreaProvider>
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
