import 'react-native-get-random-values';
import '@ethersproject/shims';

import React, {useEffect, useState, useCallback} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import '@walletconnect/react-native-compat';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import useInitialization from '../hooks/useInitialization';
import {
  universalProviderSession,
  universalProvider,
  web3Provider,
  clearSession,
  createUniversalProviderSession,
} from '../utils/UniversalProvider';
import {ExplorerModal} from '../components/ExplorerModal';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const handleSessionDisconnect = useCallback(
    async ({topic}: {topic: string}) => {
      if (topic === universalProviderSession?.topic) {
        clearSession();
        setCurrentAccount(null);
      }
    },
    [],
  );

  // Initialize universal provider
  const initialized = useInitialization({
    onSessionDisconnect: handleSessionDisconnect,
  });

  const close = () => {
    setModalVisible(false);
  };

  const getAddress = useCallback(async () => {
    try {
      if (web3Provider) {
        const signer = web3Provider.getSigner();
        const currentAddress = await signer.getAddress();
        setCurrentAccount(currentAddress);
      }
    } catch (err: unknown) {
      console.log('Error in getAddress', err);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    createUniversalProviderSession();
    setModalVisible(true);
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      await universalProvider.disconnect();
      clearSession();
      setCurrentAccount(null);
    } catch (err: unknown) {
      console.log('Error for disconnecting', err);
    }
  }, []);

  useEffect(() => {
    // NOTE: Logs to help developers debug
    // console.log('App Initialized: ', initialized);
    // console.log('useEffect currentWCURI', currentWCURI);
    if (universalProviderSession) {
      getAddress();
    }
  }, [initialized, getAddress, currentAccount, modalVisible]);

  // Improve this
  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      {!universalProviderSession ? (
        <ExplorerModal modalVisible={modalVisible} close={close} />
      ) : null}

      <View style={[styles.container, backgroundStyle.backgroundColor]}>
        {universalProviderSession ? (
          <View style={styles.container}>
            <Text style={[styles.text, isDarkMode && styles.whiteText]}>
              Address: {currentAccount}
            </Text>
            <TouchableOpacity
              style={[styles.blueButton, styles.disconnectButton]}
              onPress={handleDisconnect}>
              <Text style={styles.blueButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleConnect}
            style={styles.blueButton}
            disabled={!initialized}>
            {initialized ? (
              <Text style={styles.blueButtonText}>Connect Wallet</Text>
            ) : (
              <ActivityIndicator size="small" color="white" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  text: {
    fontWeight: '700',
  },
  whiteText: {
    color: 'white',
  },
  blueButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 150,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  blueButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  disconnectButton: {
    marginTop: 20,
  },
});
