/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
  NativeModules,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import useInitialization from './hooks/useInitialization';

// Required for TextEncoding Issue
const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const {BackgroundServiceModule} = NativeModules;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // SignClient Setup
  const initialized = useInitialization();

  useEffect(() => {
    console.log('App Initalized: ', initialized);
  }, [initialized]);

  useEffect(() => {
    BackgroundServiceModule.startService().then((status: string) =>
      console.log(status),
    );
    () =>
      BackgroundServiceModule.stopService().then((status: string) =>
        console.log(status),
      );
  }, [BackgroundServiceModule]);

  const handleOnPress = async () => {
    console.log('Is initialized: ', initialized);
    try {
      const phoneId: string = await BackgroundServiceModule.getPhoneID();
      console.log({phoneId});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Button
            onPress={handleOnPress}
            title="Check Sign Client Initialization"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
