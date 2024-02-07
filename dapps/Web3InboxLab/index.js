/**
 * @format
 */

import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import crypto from 'react-native-quick-crypto';

import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
// import {NotifyClient} from '@walletconnect/notify-client';
// import {Core} from '@walletconnect/core';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNull from './src/AppNull';

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

// Create notification channel (Android only feature)
notifee.createChannel({
  id: 'default',
  name: 'Default Channel',
  lights: false,
  vibration: true,
  importance: AndroidImportance.HIGH,
  visibility: AndroidVisibility.PUBLIC,
});

// let notifyClient;

// const projectId = process.env.ENV_PROJECT_ID;

// #region wait
async function registerAppWithFCM() {
  // This is expected to be automatically handled on iOS. See https://rnfirebase.io/reference/messaging#registerDeviceForRemoteMessages
  // if (Platform.OS === 'android') {
  // await messaging().registerDeviceForRemoteMessages();
  //   console.log('>>>> registerDeviceForRemoteMessages');
  // }
}

// Register device
registerAppWithFCM();

// // Register client to Echo server
// async function registerClient(deviceToken, clientId) {
//   console.log(
//     `>>>> register client: deviceToken:${deviceToken} clientId:${clientId} projectId:${projectId}`,
//   );
//   const body = JSON.stringify({
//     client_id: clientId,
//     token: deviceToken,
//     type: 'fcm',
//     always_raw: true,
//   });

//   const requestOptions = {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body,
//   };

//   return fetch(
//     `https://echo.walletconnect.com/${projectId}/clients`,
//     requestOptions,
//   )
//     .then(response => response.json())
//     .then(result => console.log('>>> registered client', result))
//     .catch(error => console.log('>>> error while registering client', error));
// }

// // Handle token and refresh
async function handleGetToken(token) {
  const status = await messaging().requestPermission();
  const enabled =
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('>>> handleGetToken: enabled: ', token);
    // notifyClient = await NotifyClient.init({projectId});
    // const clientId = await notifyClient.core.crypto.getClientId();
    // return registerClient(token, clientId);
  }
}
// #endregion

messaging().getToken().then(handleGetToken);
messaging().onTokenRefresh(handleGetToken);

async function onMessageReceived(remoteMessage) {
  console.log('>>> onMessageReceived', remoteMessage);

  // if (!remoteMessage.data?.blob || !remoteMessage.data?.topic) {
  //   console.log('Missing blob or topic on notification message.');
  //   return;
  // }

  // const decryptedMessage = await decryptMessage({
  //   topic: remoteMessage.data?.topic,
  //   encryptedMessage: remoteMessage.data?.blob,
  // });

  return notifee.displayNotification({
    title: remoteMessage.data.title + ' override',
    body: remoteMessage.data.body,
    id: 'default',
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
      pressAction: {
        id: 'default',
      },
    },
  });
}

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);

notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('>>> Notifee background event!', type, detail);

  const {notification, pressAction} = detail;

  // Check if the user pressed the "Mark as read" action
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    // Remove the notification
    await notifee.cancelNotification(notification.id);
  }
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    console.log('>>> The app is headless now');
    // App has been launched in the background by iOS, ignore
    return <AppNull />;
  }

  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
