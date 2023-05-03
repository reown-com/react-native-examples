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
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
  NativeModules,
} from 'react-native';
import * as Keychain from 'react-native-keychain';

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
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function handleBackgroundService() {
      const status = await BackgroundServiceModule.startService();
      console.log({status});
    }
    handleBackgroundService();
    () =>
      BackgroundServiceModule.stopService().then((status: string) =>
        console.log(status),
      );
  }, [BackgroundServiceModule]);

  const handleOnPressGetKey = async () => {
    try {
      // Get pw credentials
      const keyFromRNKeychain = await Keychain.getGenericPassword();
      console.log({keyFromRNKeychain});
    } catch (keyFromRNKeychainError) {
      console.error({keyFromRNKeychainError});
    }
    try {
      // Get internet credentials
      const internetCredsFromRNKeychain = await Keychain.getInternetCredentials(
        'https://notify.walletconnect.com',
      );
      console.log({internetCredsFromRNKeychain});
    } catch (internetCredsFromRNKeychainError) {
      console.error({internetCredsFromRNKeychainError});
    }
    try {
      const keyFromNativeKeychain = await BackgroundServiceModule.getKey();
      console.log({keyFromNativeKeychain});
    } catch (keyFromNativeKeychainError) {
      console.log({keyFromNativeKeychainError});
    }
    try {
      const plainText = await BackgroundServiceModule.decrypt();
      console.log({plainText});
    } catch (decryptError) {
      console.log({decryptError});
    }
  };
  const handleGetKey = async () => {
    try {
      // Get pw credentials
      const internetCredsFromRNKeychain =
        await BackgroundServiceModule.getInternetCredentialsForServer(
          'https://topic.walletconnect.com',
        );
      console.log({internetCredsFromRNKeychain});
    } catch (internetCredsFromRNKeychainError) {
      console.error({internetCredsFromRNKeychainError});
    }
  };

  const handleTestFlow = async () => {
    try {
      const plainText = await BackgroundServiceModule.testFlow(
        'some_topic_id_2',
      );
      console.log({plainText});
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnPressStoreKey = async () => {
    console.log('Is initialized: ', initialized);

    try {
      const generatedKey = await BackgroundServiceModule.generateAndStoreKey(
        'some_topic_id_2',
      );
      console.log({generatedKey});
    } catch (error) {
      console.log(error);
    }

    try {
      // Store the credentials
      const username = 'my_key_alias';
      const password = 'WalletConnectFTW';
      // const keyChainResult = await Keychain.setGenericPassword(
      //   username,
      //   password,
      // );
      // console.log({keyChainResult});

      const internetCredsResult = await Keychain.setInternetCredentials(
        'https://topic.walletconnect.com',
        username,
        password,
        {
          accessible: Keychain.ACCESSIBLE.ALWAYS,
          accessControl: Keychain.ACCESS_CONTROL.APPLICATION_PASSWORD,
          authenticationPrompt: 'Please provide creds',
        },
      );
      console.log({internetCredsResult});

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
          <View style={{marginBottom: 4}}>
            <Button
              onPress={handleOnPressStoreKey}
              title="Store key"
              color="#841584"
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
          <View style={{marginBottom: 4}}>
            <Button
              onPress={handleTestFlow}
              title="Test flow"
              color="#841584"
              accessibilityLabel="Learn more about this purple button"
            />
          </View>

          <Button
            onPress={handleGetKey}
            title="Get key"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
