import 'text-encoding';
import '@walletconnect/react-native-compat';

import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  createAppKit,
  AppKitButton,
  AppKit,
  solana,
  bitcoin,
  AppKitProvider,
} from '@reown/appkit-react-native';
import {EthersAdapter} from '@reown/appkit-ethers-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';
import {ENV_PROJECT_ID} from '@env';

import {siweConfig} from './utils/SiweUtils';
import {mainnet, polygon} from './utils/ChainUtils';
import {storage} from './utils/StorageUtil';
import {SolanaAdapter} from '@reown/appkit-solana-react-native';
import {BitcoinAdapter} from '@reown/appkit-bitcoin-react-native';
import {ActionsView} from './views/ActionsView';
import Toast from 'react-native-toast-message';
import {WalletInfoView} from './views/WalletInfoView';

// 1. Get projectId at https://dashboard.reown.com
const projectId = ENV_PROJECT_ID;

// 2. Create config
const metadata = {
  name: 'W3M ethers5',
  description: 'AppKit with Ethers v5',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'rn-w3m-ethers5-sample://',
  },
};

// 3. Define your chains
const networks = [mainnet, polygon, solana, bitcoin];

const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();
const bitcoinAdapter = new BitcoinAdapter();

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

// 3. Create modal
const appkit = createAppKit({
  projectId,
  metadata,
  networks,
  storage,
  adapters: [ethersAdapter, solanaAdapter, bitcoinAdapter],
  siweConfig,
  clipboardClient,
  enableAnalytics: true,
  features: {
    swaps: true,
    onramp: true,
  },
});

function App(): React.JSX.Element {
  return (
    <AppKitProvider instance={appkit}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title} variant="large-600">
          AppKit + ethers 5
        </Text>
        <FlexView style={styles.buttonContainer}>
          <WalletInfoView />
          <AppKitButton balance="show" />
          <ActionsView />
        </FlexView>
        <Toast />
        <AppKit />
      </SafeAreaView>
    </AppKitProvider>
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
