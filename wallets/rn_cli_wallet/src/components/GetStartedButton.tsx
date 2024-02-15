import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';

import {web3wallet} from '@/utils/WalletConnectUtil';
import {useTheme} from '@/hooks/useTheme';
import {useNavigation} from '@react-navigation/native';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import {createOrRestoreEIP155Wallet} from '@/utils/EIP155WalletUtil';
import {useSnapshot} from 'valtio';
import SettingsStore from '@/store/SettingsStore';

export function GetStartedButton() {
  const navigation = useNavigation();
  const Theme = useTheme();
  const disabled = !web3wallet;
  const {eip155Address: address} = useSnapshot(SettingsStore.state);
  const {account, initializeNotifyClient, notifyClient} =
    useNotifyClientContext();

  const isRegistered = account
    ? notifyClient?.isRegistered({
        account,
        domain: 'w3i-lab-mobile.vercel.app',
        allApps: true,
      })
    : false;

  const onPress = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  async function registerAccount() {
    if (!notifyClient || !account) {
      console.warn('notify client or account not available');
      return;
    }

    console.log('>>> signing and registering account');
    const {message, registerParams} = await notifyClient.prepareRegistration({
      account,
      domain: 'w3i-lab-mobile.vercel.app',
      allApps: true,
    });

    const {eip155Wallets} = await createOrRestoreEIP155Wallet();
    const signature = await eip155Wallets[address].signMessage(message);

    await notifyClient.register({
      registerParams,
      signature,
    });
  }

  React.useEffect(() => {
    if (notifyClient && account && !isRegistered) {
      registerAccount();
    }
  }, [notifyClient, account, isRegistered]);

  React.useEffect(() => {
    initializeNotifyClient();
  }, []);

  const initializing = !web3wallet || !notifyClient || !isRegistered;
  const backgroundColor =
    disabled || initializing ? Theme['bg-250'] : Theme['accent-100'];

  return (
    <TouchableOpacity
      hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
      onPress={onPress}
      style={[styles.container, {backgroundColor}]}
      disabled={disabled && initializing}>
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
