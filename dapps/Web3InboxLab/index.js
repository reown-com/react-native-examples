/**
 * @format
 */

import 'react-native-gesture-handler';

import {AppRegistry, Permissions} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import crypto from 'react-native-quick-crypto';

import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import {NotifyClient} from '@walletconnect/notify-client';
import {Core} from '@walletconnect/core';
// import {} from '@react-native-firebase/app'
// import {} from '@react-native-firebase/messaging'

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

// let notifyClient;

// const projectId = process.env.ENV_PROJECT_ID;
// const relayUrl = process.env.ENV_RELAY_URL;
// const core = new Core({
//   projectId,
//   relayUrl,
// });

// async function registerClient(deviceToken, clientId) {
//   const body = JSON.stringify({
//     client_id: clientId,
//     token: deviceToken,
//     type: 'fcm',
//   });

//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body,
//   };

//   return fetch(
//     `https://echo.walletconnect.com/${projectId}/clients`,
//     requestOptions,
//   )
//     .then(response => response.json())
//     .then(result => console.log(result))
//     .catch(error => console.log('error', error));
// }

// messaging()
//   .getToken()
//   .then(async token => {
//     console.log('get pn token:', {token});
//     const status = await messaging().requestPermission();
//     const enabled =
//       status === messaging.AuthorizationStatus.AUTHORIZED ||
//       status === messaging.AuthorizationStatus.PROVISIONAL;

//     if (enabled) {
//       console.log('get pn token perm:', status, enabled, projectId, relayUrl);
//       notifyClient = await NotifyClient.init({
//         projectId,
//       });
//       const clientId = await notifyClient.core.crypto.getClientId();
//       return registerClient(token, clientId).then(res => {
//         console.log('registerClient res', res, clientId);
//       });
//     }

//     return;
//   });

// messaging().onTokenRefresh(async token => {
//   console.log('get pn token on refresh:', {token});
//   const status = await messaging().requestPermission(
//     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//   );
//   const enabled =
//     status === messaging.AuthorizationStatus.AUTHORIZED ||
//     status === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     notifyClient = await NotifyClient.init({
//       core,
//       projectId,
//       relayUrl,
//     });
//     const clientId = await notifyClient.core.crypto.getClientId();
//     return registerClient(token, clientId).then(res => {
//       console.log('registerClient refresh res', res);
//     });
//   }

//   return;
// });

// notifee.createChannel({
//   id: 'default',
//   name: 'Default Channel',
//   lights: false,
//   vibration: true,
//   importance: AndroidImportance.HIGH,
//   visibility: AndroidVisibility.PUBLIC,
// });

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
//   if (!notifyClient) {
//     notifyClient = await NotifyClient.init({
//       core,
//       projectId,
//       relayUrl,
//     });
//   }
//   if (!remoteMessage.data?.blob || !remoteMessage.data?.topic) {
//     console.log('Missing blob or topic on notification message.');
//     return;
//   }

//   const decryptedMessage = await notifyClient?.decryptMessage({
//     topic: remoteMessage.data?.topic,
//     encryptedMessage: remoteMessage.data?.blob,
//   });

//   // Display a notification
//   return notifee.displayNotification({
//     title: decryptedMessage.title,
//     body: decryptedMessage.body,
//     android: {
//       channelId: 'default',
//       importance: AndroidImportance.HIGH,
//       visibility: AndroidVisibility.PUBLIC,
//       smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
//       // pressAction is needed if you want the notification to open the app when pressed
//       pressAction: {
//         id: 'default',
//       },
//     },
//   });
// });

// notifee.onBackgroundEvent(async ({type, detail}) => {
//   console.log('Notifee background event!', type, detail);

//   const {notification, pressAction} = detail;

//   // Check if the user pressed the "Mark as read" action
//   if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
//     // Remove the notification
//     await notifee.cancelNotification(notification.id);
//   }
// });

// function HeadlessCheck({isHeadless}) {
//   if (isHeadless) {
//     // App has been launched in the background by iOS, ignore
//     return null;
//   }

//   // Render the app component on foreground launch
//   return <App />;
// }

AppRegistry.registerComponent(appName, () => App);
