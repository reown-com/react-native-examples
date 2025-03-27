import '@walletconnect/react-native-compat';

import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  createAppKit,
  defaultConfig,
  AppKitButton,
  AppKit,
} from '@reown/appkit-ethers5-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';
import {AuthProvider} from '@reown/appkit-auth-ethers-react-native';
import {ENV_PROJECT_ID} from '@env';

import {SignMessage} from './views/SignMessage';
import {SendTransaction} from './views/SendTransaction';
import {ReadContract} from './views/ReadContract';
import {WriteContract} from './views/WriteContract';
import {SignTypedDataV4} from './views/SignTypedDataV4';
import {siweConfig} from './utils/SiweUtils';

// 1. Get projectId at https://cloud.reown.com
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

const auth = new AuthProvider({projectId, metadata});

const config = defaultConfig({
  metadata,
  extraConnectors: [auth],
});

// 3. Define your chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://eth.llamarpc.com',
};

const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-rpc.com',
};

const chains = [mainnet, polygon];

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
  chains,
  config,
  siweConfig,
  customWallets,
  clipboardClient,
  enableAnalytics: true,
  features: {
    swaps: true,
  },
});

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} variant="large-600">
        AppKit + ethers 5
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
