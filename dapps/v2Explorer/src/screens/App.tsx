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
import {ethers} from 'ethers';

import '@walletconnect/react-native-compat';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import useInitialization, {web3Provider} from '../hooks/useInitialization';
import {universalProvider, session} from '../utils/UniversalProvider';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentWCURI, setcurrentWCURI] = useState('');

  // Initialize a provider
  const initialized = useInitialization();

  useEffect(() => {
    console.log('App Initalized: ', initialized);
    console.log('App SESSION: ', session);
  }, [initialized]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  function formatNativeUrl(appUrl: string, wcUri: string): string {
    let safeAppUrl = appUrl;
    if (!safeAppUrl.includes('://')) {
      safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '');
      safeAppUrl = `${safeAppUrl}://`;
    }
    const encodedWcUrl = encodeURIComponent(wcUri);

    return `${safeAppUrl}wc?uri=${encodedWcUrl}`;
  }

  function formatUniversalUrl(appUrl: string, wcUri: string): string {
    let plainAppUrl = appUrl;
    if (appUrl.endsWith('/')) {
      plainAppUrl = appUrl.slice(0, -1);
    }
    const encodedWcUrl = encodeURIComponent(wcUri);

    return `${plainAppUrl}/wc?uri=${encodedWcUrl}`;
  }

  const navigateTo = async () => {
    // const tempApp = 'https://spot.so';
    // const tempApp = 'https://argent.link/app';
    const tempApp = 'https://aw.app';
    const tempURI =
      'wc:72120319b9fd7cf882882da2c0a00e76dce773d8db1bc8cb7e64a39b50d50a32@2?relay-protocol=irn&symKey=f0068701743003ec01aa6ab01210b59c2dfd1f4cab85b07cd97b1c4d22e04e94';
    console.log('currentWCURI: ', currentWCURI);
    const testtwo = formatUniversalUrl(tempApp, currentWCURI);
    console.log('testtwo: ', testtwo);
    // const t4st =
    //   'https://aw.app/wc?uri=wc%3Aa95ad42a-b798-425a-93a8-3f72971bafd6%401%3Fbridge%3Dhttps%253A%252F%252Fm.bridge.walletconnect.org%26key%3Dfbb7e3ed3015c414e71403063fa81fb9c39df051f736b220516e6a04bd0c7562';
    // const test =
    //   'https://aw.app/wc?uri=wc%3Ad090600c-a004-4c91-bcbc-03394ae45d6b%401%3Fbridge%3Dhttps%253A%252F%252Fh.bridge.walletconnect.org%26key%3D51cf11e5962a35aa21fe54e6f07add14ea65c99b2611f068b85bc083cffcdaa7';
    await Linking.openURL(testtwo);
    // const supported = await Linking.canOpenURL(testtwo);

    // if (supported) {
    //   // Opening the link with some app, if the URL scheme is "http" the web link should be opened
    //   // by some browser in the mobile
    //   await Linking.openURL(testtwo);
    // } else {
    //   Alert.alert(`Don't know how to open this URL: ${deepLink}`);
    // }
  };

  return (
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
        <Text style={{color: 'blue'}}> React Native dApp V2 Side</Text>
        <Button title="Link" onPress={() => navigateTo()} />
      </View>
    </SafeAreaView>
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
