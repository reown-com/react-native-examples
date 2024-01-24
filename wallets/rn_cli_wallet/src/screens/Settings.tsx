import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

import {eip155Wallets} from '../utils/EIP155WalletUtil';
import {useSnapshot} from 'valtio';
import SettingsStore from '../store/SettingsStore';

const SettingsScreen = () => {
  const {eip155Address} = useSnapshot(SettingsStore.state);

  return (
    <View>
      <View style={styles.textContainer}>
        <View style={styles.smallMarginTop}>
          <Text style={styles.normalText}>ETH Address:</Text>
          <Text style={styles.greyText}>{eip155Address}</Text>
        </View>

        <View style={styles.smallMarginTop}>
          <Text style={styles.normalText}>ETH Seed Phrase:</Text>
          <Text style={styles.greyText}>
            {eip155Wallets[eip155Address].getMnemonic()}
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
    flexDirection: 'row',
  },
});
