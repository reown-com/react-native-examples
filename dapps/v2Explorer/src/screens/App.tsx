/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import 'react-native-get-random-values';
import '@ethersproject/shims';

import '@walletconnect/react-native-compat';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import useInitialization, {web3Provider} from '../hooks/useInitialization';
import {universalProviderSession} from '../utils/UniversalProvider';
import {ExplorerModal} from '../components/ExplorerModal';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Initialize a provider
  const initialized = useInitialization();

  const close = () => {
    setModalVisible(false);
  };

  const getAddress = useCallback(async () => {
    try {
      const signer = web3Provider.getSigner();
      const currentAddress = await signer.getAddress();
      setCurrentAccount(currentAddress);
    } catch (err: unknown) {
      console.log('Error for initializing', err);
    }
  }, []);

  useEffect(() => {
    // console.log('App Initalized: ', initialized);
    // console.log('useEffect currentWCURI', currentWCURI);
    if (universalProviderSession) {
      getAddress();
    }
  }, [initialized, getAddress, currentAccount, modalVisible]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />

        {!universalProviderSession ? (
          <ExplorerModal modalVisible={modalVisible} close={close} />
        ) : null}

        <View
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          {universalProviderSession ? (
            <View>
              <Text style={styles.whiteText}>👉🥺👈</Text>
              <Text style={styles.whiteText}>Address: {currentAccount}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.connectWalletButton}>
              <Text style={styles.whiteText}>Connect Wallet</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

export default App;

const styles = StyleSheet.create({
  whiteText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
  connectWalletButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 150,
    height: 50,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
