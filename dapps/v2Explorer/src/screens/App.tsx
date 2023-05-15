import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [clientId, setClientId] = useState<string>();
  const {isConnected, provider} = useWeb3Modal();
  const backgroundColor = isDarkMode
    ? DarkTheme.background2
    : LightTheme.background2;

  const onCopy = (value: string) => {
    Clipboard.setString(value);
    Alert.alert('Copied to clipboard');
  };

  useEffect(() => {
    async function getClientId() {
      if (provider && isConnected) {
        const _clientId = await provider?.client?.core.crypto.getClientId();
        setClientId(_clientId);
      } else {
        setClientId(undefined);
      }
    }

    getClientId();
  }, [isConnected, provider]);

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <View style={[styles.container, {backgroundColor}]}>
        {clientId && (
          <TouchableOpacity
            style={[styles.card, isDarkMode && styles.cardDark]}
            onPress={() => onCopy(clientId)}>
            <Text style={[styles.propTitle, isDarkMode && styles.darkText]}>
              {'Client ID:'}{' '}
              <Text style={[styles.propValue, isDarkMode && styles.darkText]}>
                {clientId}
              </Text>
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.centerContainer}>
          <Web3Button style={styles.web3Button} />
          {isConnected && <BlockchainActions />}
        </View>
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
  card: {
    margin: 16,
    marginBottom: 64,
    padding: 16,
    borderColor: LightTheme.accent,
    backgroundColor: LightTheme.background1,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: LightTheme.foreground1,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
  },
  cardDark: {
    backgroundColor: DarkTheme.background1,
    borderColor: DarkTheme.accent,
    shadowColor: DarkTheme.foreground1,
    shadowOpacity: 0.5,
  },
  propTitle: {
    fontWeight: 'bold',
  },
  propValue: {
    fontWeight: 'normal',
  },
  darkText: {
    color: DarkTheme.foreground1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  web3Button: {
    width: 180,
  },
});
