import React from 'react';
import {Alert, Text, View} from 'react-native';

import {NotifyClient} from '@walletconnect/notify-client';

import {Button} from '@web3modal/ui-react-native';
import {ENV_PROJECT_ID} from '@env';
import {useAccount, useSignMessage} from 'wagmi';
import useNotifyClientContext from '../hooks/useNotifyClientContext';

interface Props {}

export function InitializeNotifyClientButton({}: Props) {
  const {account, initializing, notifyClient} = useNotifyClientContext();
  const initialized = !!notifyClient;

  const {signMessageAsync} = useSignMessage();

  async function registerAccount() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }

    const {message, registerParams} = await notifyClient.prepareRegistration({
      account,
      domain: 'w3m-dapp.vercel.app', // pass your app's bundle identifier.
      allApps: true,
    });
    const signature = await signMessageAsync({message: message});

    await notifyClient.register({
      registerParams,
      signature,
    });
  }

  if (!account) return;

  return (
    <View style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <Text>
        {initializing
          ? 'Initializing Notify Client...'
          : initialized
          ? 'Notify Client Initialized'
          : 'Notify Client Not Initialized'}
      </Text>
      <Button onPress={registerAccount}>Register Account</Button>
    </View>
  );
}
