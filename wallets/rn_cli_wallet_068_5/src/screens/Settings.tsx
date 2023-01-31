import React from 'react';
import {
  Text,
  StatusBar,
  useColorScheme,
  View,
  StyleSheet,
  ImageBackground,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import {GetStartedButton} from '../components/GetStartedButton';

const SettingsScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.textContainer}>
        <Text style={styles.welcomeHeading}>Welcome</Text>
        <Text style={styles.greyText}>
          We made this Example Wallet App to help developers integrate the
          WalletConnect SDK and provide an amazing experience to their users.
        </Text>
      </View>
    </View>
  );
};

export default SettingsScreen;

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
