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
        domain: '',
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

    try {
      const {message, registerParams} = await notifyClient.prepareRegistration({
        account,
        domain: '',
        allApps: true,
      });

      const {eip155Wallets} = await createOrRestoreEIP155Wallet();
      const signature = await eip155Wallets[address].signMessage(message);

      await notifyClient.register({
        registerParams,
        signature,
      });
    } catch (error) {
      if (error?.message?.includes('user has an existing stale identity.')) {
        await notifyClient.unregister({account});
        registerAccount();
      }
    }
  }

  React.useEffect(() => {
    if (notifyClient && account && !isRegistered) {
      registerAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyClient, account, isRegistered]);

  React.useEffect(() => {
    initializeNotifyClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializing = !web3wallet || !notifyClient || !isRegistered;
  const backgroundColor =
    disabled || initializing ? '#e2e2e2' : Theme['accent-100'];

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
