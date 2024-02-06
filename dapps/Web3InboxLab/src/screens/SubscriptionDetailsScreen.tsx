import * as React from 'react';
import {useRoute} from '@react-navigation/native';
import {ActivityIndicator, Alert, FlatList, Text, View} from 'react-native';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import NotificationItem from '../components/NotificationItem';
import ScreenContainer from '../components/ScreenContainer';
import {colors} from '../utils/theme';

interface NotifyNotification {
  title: string;
  sentAt: number;
  body: string;
  id: string;
  url: string | null;
  type: string;
}

function NotificationItemSkeleton() {
  return (
    <View
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.backgroundActive,
      }}>
      <View
        style={{
          width: '50%',
          height: 16,
          backgroundColor: colors.backgroundActive,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          width: '70%',
          height: 12,
          backgroundColor: colors.backgroundActive,
          borderRadius: 4,
        }}
      />
    </View>
  );
}

const Skeletons = Array(3).fill(<NotificationItemSkeleton />);

export default function SubscriptionDetailsScreen() {
  const {params} = useRoute();
  const {notifications, setNotifications} = useNotifyClientContext();
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const topic = params?.topic;

  const topicNotifications = notifications[params?.topic];
  const sortedByDate = topicNotifications?.sort(
    (a: NotifyNotification, b: NotifyNotification) => b.sentAt - a.sentAt,
  );
  const lastItem = sortedByDate?.[sortedByDate.length - 1]?.id;

  const {account, notifyClient} = useNotifyClientContext();

  async function getNotificationHistory(startingAfter?: string) {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }
    setIsLoading(true);

    const accountSubscriptions = await notifyClient.getNotificationHistory({
      topic,
      limit: 15,
      startingAfter,
    });

    setNotifications(topic, accountSubscriptions.notifications);
    setHasMore(accountSubscriptions.hasMore);
    setIsLoading(false);

    return accountSubscriptions;
  }

  React.useEffect(() => {
    getNotificationHistory();
  }, [topic]);

  if (!topic) return null;

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={{
          flex: 1,
          paddingTop: 15,
        }}
        data={sortedByDate}
        keyExtractor={item => item.id}
        onEndReached={() => {
          if (hasMore && lastItem) {
            getNotificationHistory(lastItem);
          }
        }}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        renderItem={({item}) => (
          <NotificationItem
            key={item.id}
            title={item.title}
            description={item.body}
            url={item.url}
            onPress={() => {}}
            sentAt={item.sentAt}
          />
        )}
      />
      {isLoading ? Skeletons : null}
      {isLoading ? <ActivityIndicator /> : null}
    </ScreenContainer>
  );
}
