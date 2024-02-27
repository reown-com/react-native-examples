import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

import {NotifyClient} from '@walletconnect/notify-client';
import {decryptMessage} from '@walletconnect/notify-message-decrypter';
import {getSymKey, registerClient} from '@/utils/NotifyClient';
import {Platform} from 'react-native';

let notifyClient;

const projectId = process.env.ENV_PROJECT_ID;

async function handleGetToken(token: string) {
  let status = await messaging().requestPermission();

  const enabled =
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    notifyClient = await NotifyClient.init({projectId});
    const clientId = await notifyClient.core.crypto.getClientId();
    return registerClient(token, clientId);
  }
}

messaging().getToken().then(handleGetToken);
messaging().onTokenRefresh(handleGetToken);

// Create notification channel (Android only feature)
notifee.createChannel({
  id: 'default',
  name: 'Default Channel',
  lights: false,
  vibration: true,
  importance: AndroidImportance.HIGH,
  visibility: AndroidVisibility.PUBLIC,
});
notifee.onBackgroundEvent(async () => {});

async function onMessageReceived(remoteMessage: any) {
  if (!remoteMessage.data?.message || !remoteMessage.data?.topic) {
    console.log('Missing message or topic on notification message.');
    return;
  }

  try {
    if (Platform.OS === 'ios') {
      const categories = await notifee.getNotificationCategories();
      if (
        !categories.find(category => category.id === remoteMessage.data?.topic)
      ) {
        await notifee.setNotificationCategories([
          ...categories,
          {id: remoteMessage.data?.topic},
        ]);
      }
    }
  } catch (error) {}

  try {
    const symkey = await getSymKey(remoteMessage.data?.topic);

    const decryptedMessage = await decryptMessage({
      topic: remoteMessage.data?.topic,
      encoded: remoteMessage.data?.message,
      symkey,
    });

    return notifee.displayNotification({
      title: decryptedMessage.title,
      body: decryptedMessage.body,
      ios: {
        sound: 'default',
        categoryId: remoteMessage.data?.topic,
      },
      android: {
        channelId: 'default',
        groupId: remoteMessage.data?.topic,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    return;
  }
}

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);
