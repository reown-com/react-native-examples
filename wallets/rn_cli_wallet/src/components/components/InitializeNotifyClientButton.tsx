import React from 'react';
import {Alert, Pressable, Text, View} from 'react-native';

// import {useSignMessage} from 'wagmi';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import notifee from '@notifee/react-native';

export function InitializeNotifyClientButton() {
  const {account, initializing, notifyClient} = useNotifyClientContext();
  const initialized = !!notifyClient;

  // const {signMessageAsync} = useSignMessage();

  async function registerAccount() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }

    // const {message, registerParams} = await notifyClient.prepareRegistration({
    //   account,
    //   domain: 'w3m-dapp.vercel.app', // pass your app's bundle identifier.
    //   allApps: true,
    // });
    // // const signature = await signMessageAsync({message: message});

    // await notifyClient.register({
    //   registerParams,
    //   signature,
    // });
  }

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
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
      <Pressable onPress={registerAccount}>Register Account</Pressable>
      <Pressable
        onPress={async () => {
          await notifee.requestPermission();
        }}>
        Request Permissions
      </Pressable>
      <Pressable onPress={onDisplayNotification}>
        Example Notifee Notification
      </Pressable>
    </View>
  );
}
