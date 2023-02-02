import React, {useEffect} from 'react';
import '@walletconnect/react-native-compat';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from './OnboardingScreen';
import HomeScreen from './HomeScreen';
import SettingsScreen from './Settings';

import useInitialization from '../hooks/useInitialization';
import {web3wallet} from '../utils/Web3WalletClient';

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
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{headerShown: true, headerTitle: ''}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
