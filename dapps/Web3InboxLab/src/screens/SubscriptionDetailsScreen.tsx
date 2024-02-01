import * as React from 'react';
import {useRoute} from '@react-navigation/native';
import {Alert, Text, View} from 'react-native';
import useNotifyClient from '../hooks/useNotifyClient';
import NotificationItem from '../components/NotificationItem';
import ScreenContainer from '../components/ScreenContainer';

interface NotifyNotification {
  title: string;
  sentAt: number;
  body: string;
  id: string;
  url: string | null;
  type: string;
}

export default function SubscriptionDetailsScreen() {
  const {params} = useRoute();
  const topic = params?.topic;
  const name = params?.name;

  const {account, notifyClient} = useNotifyClient();
  const [notifications, setNotifications] = React.useState<
    NotifyNotification[]
  >([]);

  async function getNotificationHistory() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }

    const accountSubscriptions = notifyClient.getNotificationHistory({
      topic,
      limit: 10,
    });

    return accountSubscriptions;
  }

  React.useEffect(() => {
    async function getNotifications() {
      const notificationHistoryData = await getNotificationHistory();
      if (!notificationHistoryData) return;
      setNotifications(notificationHistoryData?.notifications);
    }
    getNotifications();
  }, []);

  if (!topic) return null;

  return (
    <ScreenContainer>
      {notifications.map(item => {
        return (
          <NotificationItem
            title={item.title}
            description={item.body}
            url={item.url}
            onPress={() => {}}
            sentAt={item.sentAt}
          />
        );
      })}
    </ScreenContainer>
  );
}
