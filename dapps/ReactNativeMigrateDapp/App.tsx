/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import React from 'react';

import Navigator from './src/navigation';

const clientMeta = {
  name: 'Deprecated App',
  description: 'RN dApp by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

function App(): JSX.Element {
  return (
    <WalletConnectProvider
      bridge="https://bridge.walletconnect.org"
      clientMeta={clientMeta}
      redirectUrl="yourappscheme://"
      storageOptions={{
        asyncStorage: AsyncStorage,
      }}>
      <Navigator />
    </WalletConnectProvider>
  );
}

export default App;
