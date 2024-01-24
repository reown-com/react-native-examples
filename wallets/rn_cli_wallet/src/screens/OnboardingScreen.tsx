import React, {useEffect} from 'react';
import {View, StyleSheet, ImageBackground} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {GetStartedButton} from '../components/GetStartedButton';
import Text from '../components/Text';
import useInitialization from '../hooks/useInitialization';
import backgroundImageSrc from '../assets/ethCalculatorBG.png';
import useWalletConnectEventsManager from '../hooks/useWalletConnectEventsManager';
import {web3wallet} from '../utils/WalletConnectUtil';
import {RELAYER_EVENTS} from '@walletconnect/core';

const OnboardingScreen = () => {
  // Step 1 - Initialize wallets and wallet connect client
  const initialized = useInitialization();

  // Step 2 - Once initialized, set up wallet connect event manager
  useWalletConnectEventsManager(initialized);
  useEffect(() => {
    if (!initialized) {
      return;
    }

    web3wallet.core.relayer.on(RELAYER_EVENTS.connect, () => {
      console.log('Network connection is restored!');
    });

    web3wallet.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
      console.log('Network connection lost.');
    });
  }, [initialized]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={backgroundImageSrc}
        resizeMode="contain"
        style={styles.backgroundImage}>
        <View style={styles.textContainer}>
          <Text>Web3Wallet</Text>
          <Text>React Native</Text>
        </View>
        <GetStartedButton />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});
