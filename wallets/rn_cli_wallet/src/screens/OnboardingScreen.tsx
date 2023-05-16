import React, {useEffect} from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
  StyleSheet,
  ImageBackground,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import {GetStartedButton} from '../components/GetStartedButton';
import {W3WText} from '../components/W3WText';
import {TextContent} from '../utils/Text';
import {SafeAreaView} from 'react-native-safe-area-context';
import useInitialization from '../hooks/useInitialization';

const backgroundImageSrc = require('../assets/ethCalculatorBG.png');

const OnboardingScreen = () => {
  const initialized = useInitialization();

  useEffect(() => {
    console.log('Web3WalletSDK initialized:', initialized);
  }, [initialized]);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ImageBackground
        source={backgroundImageSrc}
        resizeMode="contain"
        style={styles.backgroundImage}>
        <View style={styles.textContainer}>
          <W3WText value={'Welcome'} />
          <W3WText
            value={TextContent.welcomeDescription}
            color={'grey'}
            type={'body'}
          />
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
