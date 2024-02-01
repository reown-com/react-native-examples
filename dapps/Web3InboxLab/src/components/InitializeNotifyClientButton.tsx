import React from 'react';
import {Alert, Text, View} from 'react-native';

import {NotifyClient} from '@walletconnect/notify-client';

import {Button} from '@web3modal/ui-react-native';
import {ENV_PROJECT_ID} from '@env';
import {useAccount, useSignMessage} from 'wagmi';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import useNotifyClient from '../hooks/useNotifyClient';

interface Props {}

export function InitializeNotifyClientButton({}: Props) {
  const {address} = useAccount();
  const {account, setNotifyClient, notifyClient} = useNotifyClient();

  const [initializing, setInitializing] = React.useState(false);
  const {signMessageAsync} = useSignMessage();

  async function handleInitializeNotifyClient() {
    setInitializing(true);

    console.log('proj', ENV_PROJECT_ID);

    const notifyClient = await NotifyClient.init({
      projectId: ENV_PROJECT_ID,
    });

    setNotifyClient(notifyClient);
    setInitializing(false);
  }

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

  async function subscribeToDapp() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }

    const appDomain = 'w3m-dapp.vercel.app';

    await notifyClient.subscribe({
      account,
      appDomain,
    });
  }

  return (
    <View style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <Text>
        {notifyClient
          ? 'Notify Client Initialized'
          : 'Notify Client Not Initialized'}
      </Text>
      <Button disabled={initializing} onPress={handleInitializeNotifyClient}>
        {initializing ? 'Initializing...' : 'Initialize Notify Client'}
      </Button>
      <Button onPress={registerAccount}>Register Account</Button>
    </View>
  );
}
