/**
 * @format
 */

import {AppRegistry, PermissionsAndroid} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import crypto from 'react-native-quick-crypto';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidVisibility, EventType} from '@notifee/react-native';
import {NotifyClient} from '@walletconnect/notify-client';
import {Core} from '@walletconnect/core';

const polyfillDigest = async (algorithm, data) => {
  const algo = algorithm.replace('-', '').toLowerCase();
  const hash = crypto.createHash(algo);
  hash.update(data);
  return hash.digest();
};

globalThis.crypto = crypto;
globalThis.crypto.subtle = {
  digest: polyfillDigest,
};

messaging()
  .getToken()
  .then(async token => {
    console.log({token});
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    console.log({enabled});

    if (!enabled) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    messaging().setAutoInitEnabled(true);
  });

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const projectId = process.env.ENV_PROJECT_ID;
  const relayUrl = process.env.ENV_RELAY_URL;
  const core = new Core({
    projectId,
    relayUrl,
  });
  const notifyClient = await NotifyClient.init({
    core,
    projectId,
    relayUrl,
  });
  console.log({blob: remoteMessage.data?.blob});
  if (!remoteMessage.data?.blob || !notifyClient) {
    return;
  }
  const decryptedMessage = await notifyClient?.decryptMessage({
    topic: remoteMessage.data?.topic,
    encryptedMessage: remoteMessage.data?.blob,
  });
  console.log(
    'A new background FCM message arrived!',
    JSON.stringify(decryptedMessage),
  );

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: decryptedMessage.title,
    body: decryptedMessage.body,
    android: {
      channelId,
      visibility: AndroidVisibility.PUBLIC,
      smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'mark-as-read',
      },
    },
  });
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;

  // Check if the user pressed the "Mark as read" action
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    // Remove the notification
    await notifee.cancelNotification(notification.id);
  }
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
