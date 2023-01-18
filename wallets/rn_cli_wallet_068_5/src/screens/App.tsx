import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  Button,
  SafeAreaView,
  Alert,
  StatusBar,
  useColorScheme,
  View,
  TextInput,
  StyleSheet,
  ImageBackground,
} from 'react-native';

import {SignClientTypes} from '@walletconnect/types';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
// import {Core} from '@walletconnect/core';
// import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';
import SignClient from '@walletconnect/sign-client';
import {SessionTypes} from '@walletconnect/types';

import '@walletconnect/react-native-compat';
import {WalletConnectModal} from '../modals/WalletConnectModal';

import {NavigationContainer} from '@react-navigation/native';
import {GetStartedButton} from '../components/GetStartedButton';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from './OnboardingScreen';
import HomeScreen from './HomeScreen';

// Required for TextEncoding Issue
const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
});

const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const backgroundImageSrc = require('../assets/ethCalculatorBG.png');

  //@notice: Rendering of Heading + ScrollView of Conenctions + Action Button
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  backgroundImage: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeHeading: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    marginBottom: 10,
  },
  greyText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#798686',
  },
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // ToDo: Fix this by passing props in StyleSheet
    // backgroundColor: isDarkMode ? Colors.black : Colors.white,
  },
  textInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
  flexRow: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
  },
});
