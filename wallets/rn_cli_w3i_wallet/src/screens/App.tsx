import React from 'react';
import '@walletconnect/react-native-compat';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from './OnboardingScreen';
import HomeScreen from './HomeScreen';
import SettingsScreen from './Settings';

// Required for TextEncoding Issue
const TextEncodingPolyfill = require('text-encoding');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
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
