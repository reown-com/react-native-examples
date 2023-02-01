import React from 'react';
import {
  Text,
  StatusBar,
  useColorScheme,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import {SafeAreaView} from 'react-native-safe-area-context';
import {currentETHAddress, currentETHMnemonic} from '../utils/Web3WalletClient';
import {useNavigation} from '@react-navigation/native';

const SettingsScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.textContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.welcomeHeading}>Settings</Text>
        <Text style={styles.normalText}>ETH Address:</Text>
        <Text style={styles.greyText}>{currentETHAddress}</Text>
        <Text style={styles.normalText}>ETH Seed Phrase:</Text>
        <Text style={styles.greyText}>{currentETHMnemonic}</Text>
      </View>
    </SafeAreaView>
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
    padding: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  welcomeHeading: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    marginBottom: 10,
  },
  normalText: {
    fontSize: 15,
    lineHeight: 21,
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
