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
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <Text>Test</Text>
        <TouchableOpacity onPress={() => connector.connect()}>
          <Text>CONNECT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default withWalletConnect(App, {
  clientMeta: {
    description: 'Connect with WalletConnect',
  },
  redirectUrl: 'yourappscheme://',
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
});
