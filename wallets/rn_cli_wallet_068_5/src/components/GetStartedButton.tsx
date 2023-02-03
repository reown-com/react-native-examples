import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {web3wallet} from '../utils/Web3WalletClient';

export function GetStartedButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
      onPress={() => navigation.navigate('Home')}
      disabled={!web3wallet}>
      <LinearGradient
        colors={!web3wallet ? ['#E5E5E5', '#E1EAEE'] : ['#3396FF', '#0D7DF2']}
        style={styles.blueButtonContainer}>
        <Text style={!web3wallet ? styles.disabledText : styles.mainText}>
          {!web3wallet ? 'Initializing...' : 'Get Started'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blueButtonContainer: {
    marginBottom: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 56,
    width: 350,
    boxShadow:
      '0px 6px 14px -6px rgba(0, 0, 0, 0.12), 0px 10px 32px -4px rgba(0, 0, 0, 0.1)',
  },
  mainText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: 'white',
  },
  disabledText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: 'black',
  },
  imageContainer: {
    width: 24,
    height: 24,
  },
});
