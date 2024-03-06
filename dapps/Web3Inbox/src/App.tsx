import '@walletconnect/react-native-compat';
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from '@web3modal/wagmi-react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import * as Sentry from '@sentry/react-native';

import {WagmiConfig} from 'wagmi';
import {arbitrum, mainnet, polygon, avalanche, bsc} from 'wagmi/chains';
import {ENV_PROJECT_ID, ENV_SENTRY_DSN} from '@env';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import RootStackNavigator from './navigation/RootStack';

if (!__DEV__ && ENV_SENTRY_DSN) {
  Sentry.init({
    dsn: ENV_SENTRY_DSN,
  });
}

const projectId = ENV_PROJECT_ID;

const metadata = {
  name: 'Web3Inbox',
  description: 'Web3Inbox',
  url: 'https://web3inbox.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'web3inbox://',
  },
};

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const chains = [mainnet, polygon, arbitrum, avalanche, bsc];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  clipboardClient,
  excludeWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Hide coinbase until their SDK is implemented
  ],
});

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{flex: 1}}>
        <WagmiConfig config={wagmiConfig}>
          <RootStackNavigator />
          <Web3Modal />
        </WagmiConfig>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

export default App;
