import {useEffect, useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import NotificationItem from '@/components/NotificationItem';
import NotificationItemSkeleton from '@/components/NotificationItemSkeleton';
import {SubscriptionsStackScreenProps} from '@/utils/TypesUtil';
import styles from './styles';
interface NotifyNotification {
  title: string;
  sentAt: number;
  body: string;
  id: string;
  url: string | null;
  type: string;
}

type Props = SubscriptionsStackScreenProps<'SubscriptionDetail'>;

export default function SubscriptionDetail({route}: Props) {
  const topic = route.params.topic;
  const {notifications, setNotifications} = useNotifyClientContext();
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const topicNotifications = notifications[topic];
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

  useEffect(() => {
    getNotificationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  if (!topic) {
    return null;
  }

  return (
    <FlatList
      data={sortedByDate}
      keyExtractor={item => item.sentAt.toString()}
      onEndReached={() => {
        if (hasMore && lastItem) {
          getNotificationHistory(lastItem);
        }
      }}
      ListFooterComponent={
        isLoading ? (
          <View style={styles.loader}>
            {Array(3)
              .fill(null)
              .map((_, index) => {
                return <NotificationItemSkeleton key={index} />;
              })}
          </View>
        ) : null
      }
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
  );
}
