/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Alert,
  Button,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import 'react-native-get-random-values';
import '@ethersproject/shims';

import '@walletconnect/react-native-compat';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import useInitialization, {web3Provider} from '../hooks/useInitialization';
import {
  universalProviderSession,
  currentWCURI,
} from '../utils/UniversalProvider';
import {ExplorerModal} from '../components/ExplorerModal';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // Initialize a provider
  const initialized = useInitialization();

  useEffect(() => {
    console.log('App Initalized: ', initialized);
    console.log('useEffect currentWCURI', currentWCURI);
  }, [initialized]);

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
        <View
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          {universalProviderSession ? (
            <Text style={{color: 'white'}}>Connected 👉🥺👈</Text>
          ) : null}
        </View>
      </SafeAreaView>
      {!universalProviderSession ? <ExplorerModal /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
