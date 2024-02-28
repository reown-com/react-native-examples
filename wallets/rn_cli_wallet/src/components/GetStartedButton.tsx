import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';

import {web3wallet} from '@/utils/WalletConnectUtil';
import {useTheme} from '@/hooks/useTheme';
import {useNavigation} from '@react-navigation/native';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import {LightTheme} from '@/utils/ThemeUtil';

export function GetStartedButton() {
  const navigation = useNavigation();
  const disabled = !web3wallet;
  const {isRegistered, notifyClient} = useNotifyClientContext();

  const onPress = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const initializing = !web3wallet || !notifyClient || !isRegistered;
  const backgroundColor =
    disabled || initializing ? LightTheme['bg-300'] : LightTheme['accent-100'];

  return (
    <TouchableOpacity
      hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
      onPress={onPress}
      style={[styles.container, {backgroundColor}]}
      disabled={disabled || initializing}>
      <Text style={initializing ? styles.disabledText : styles.mainText}>
        {initializing ? 'Initializing...' : 'Get Started'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 56,
    width: 350,
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
