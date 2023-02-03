import React from 'react';
import {Text, StatusBar, useColorScheme, View, StyleSheet} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import {currentETHAddress} from '../utils/Web3WalletClient';

import {eip155Wallets} from '../utils/EIP155Wallet';

const SettingsScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <View>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.textContainer}>
        <View style={styles.smallMarginTop}>
          <Text style={styles.normalText}>ETH Address:</Text>
          <Text style={styles.greyText}>{currentETHAddress}</Text>
        </View>

        <View style={styles.smallMarginTop}>
          <Text style={styles.normalText}>ETH Seed Phrase:</Text>
          <Text style={styles.greyText}>
            {eip155Wallets[currentETHAddress].getMnemonic()}
          </Text>
        </View>
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
  smallMarginTop: {
    marginTop: 16,
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
