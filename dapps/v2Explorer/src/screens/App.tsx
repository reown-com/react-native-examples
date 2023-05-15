import React from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import '@walletconnect/react-native-compat';
import {useWeb3Modal, Web3Button, Web3Modal} from '@web3modal/react-native';
import Clipboard from '@react-native-clipboard/clipboard';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID} from '@env';

import {DarkTheme, LightTheme} from '../constants/Colors';
import {providerMetadata, sessionParams} from '../constants/Config';
import {BlockchainActions} from '../components/BlockchainActions';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const {isConnected} = useWeb3Modal();
  const backgroundColor = isDarkMode
    ? DarkTheme.background2
    : LightTheme.background2;

  const onCopy = (value: string) => {
    Clipboard.setString(value);
    Alert.alert('Copied to clipboard');
  };

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <View style={[styles.container, {backgroundColor}]}>
        <Web3Button style={styles.web3Button} />
        {isConnected && <BlockchainActions />}
        <Web3Modal
          projectId={ENV_PROJECT_ID}
          providerMetadata={providerMetadata}
          sessionParams={sessionParams}
          onCopyClipboard={onCopy}
        />
      </View>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  web3Button: {
    width: 180,
  },
});
