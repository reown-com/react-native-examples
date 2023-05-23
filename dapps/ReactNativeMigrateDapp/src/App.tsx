/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useWalletConnect,
  withWalletConnect,
} from '@walletconnect/react-native-dapp';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const connector = useWalletConnect();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View
        style={{
          backgroundColor: Colors.white,
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {connector?.connected ? (
          <TouchableOpacity onPress={() => connector.killSession()}>
            <Text>Kill session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => connector.connect()}>
            <Text>CONNECT</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

export default withWalletConnect(App, {
  clientMeta: {
    name: 'Deprecated App',
    description: 'RN dApp by WalletConnect',
    url: 'https://walletconnect.com/',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
  redirectUrl: 'yourappscheme://',
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
});
