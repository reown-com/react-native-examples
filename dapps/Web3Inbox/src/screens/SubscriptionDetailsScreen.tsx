import {useSnapshot} from 'valtio';
import {useCallback, useEffect, useState} from 'react';
import {FlatList, Image, Pressable, StyleSheet} from 'react-native';
import NotificationItem from '@/components/NotificationItem';
import {AccountController} from '@/controllers/AccountController';
import {NotifyController} from '@/controllers/NotifyController';
import {Text} from '@/components/Text';
import type {NotifyClientTypes} from '@walletconnect/notify-client';
import {Spacing} from '@/utils/ThemeUtil';
import useTheme from '@/hooks/useTheme';
import NotificationItemSkeleton from '@/components/NotificationItemSkeleton';
import SettingsIcon from '@/icons/settings-tab';
import {Divider} from '@/components/Divider';
import {RootStackScreenProps} from '@/utils/TypesUtil';

interface NotifyNotification {
  title: string;
  sentAt: number;
  body: string;
  id: string;
  url: string | null;
  type: string;
}

const HeaderButton = (color: string, onPress: () => void) => {
  return (
    <Pressable onPress={onPress}>
      <SettingsIcon height={20} width={20} focused={false} fill={color} />
    </Pressable>
  );
};

function ListHeader({
  imageUrl,
  name,
  domain,
  description,
}: {
  imageUrl: string;
  name: string;
  domain: string;
  description: string;
}) {
  // TODO: add gradient background
  return (
    <>
      <Image source={{uri: imageUrl}} style={styles.image} />
      <Text center variant="large-600" color="fg-100">
        {name}
      </Text>
      <Text center color="fg-200" variant="small-500" style={styles.domain}>
        {domain}
      </Text>
      <Text center color="fg-100" variant="paragraph-400">
        {description}
      </Text>
    </>
  );
}

function ListEmpty({isLoading}: {isLoading: boolean}) {
  if (isLoading) {
    return (
      <>
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
        <NotificationItemSkeleton />
      </>
    );
  }
  return null;
}

type Props = RootStackScreenProps<'SubscriptionDetails'>;

export default function SubscriptionDetailsScreen({route, navigation}: Props) {
  const {params} = route;
  const [hasMore, setHasMore] = useState(false);
  const {notifications, address} = useSnapshot(AccountController.state);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const topic = params?.topic;
  const metadata = params?.metadata as NotifyClientTypes.Metadata;
  const Theme = useTheme();

  const topicNotifications = notifications[topic]
    ? [...notifications[topic]]
    : [];

  const sortedByDate = topicNotifications.sort(
    (a: NotifyNotification, b: NotifyNotification) => b.sentAt - a.sentAt,
  );

  const lastItem = sortedByDate?.[sortedByDate.length - 1]?.id;

  const handleLoadMoreNotifications = () => {
    if (hasMore && lastItem) {
      getNotificationHistory(lastItem);
    }
  };

  const getNotificationHistory = useCallback(
    async (startingAfter?: string) => {
      const client = NotifyController.getClient();
      if (!client || !address) {
        return;
      }

      if (!startingAfter) {
        setIsLoading(true);
      }

      const accountSubscriptions = await client.getNotificationHistory({
        topic,
        limit: 15,
        startingAfter,
      });

      AccountController.setNotifications(
        topic,
        accountSubscriptions.notifications,
        !startingAfter,
      );
      setHasMore(accountSubscriptions.hasMore);

      if (!startingAfter) {
        setIsLoading(false);
      }

      setIsRefreshing(false);

      return accountSubscriptions;
    },
    [address, topic],
  );

  useEffect(() => {
    getNotificationHistory();
  }, [topic, getNotificationHistory]);

  useEffect(() => {
    if (metadata?.name) {
      navigation.setOptions({
        title: metadata.name,
        headerRight: HeaderButton.bind(null, Theme['fg-150'], () =>
          navigation.navigate('SubscriptionSettings', {
            topic,
          }),
        ),
      });
    }
  }, [metadata, navigation, Theme, topic]);

  if (!topic) {
    return null;
  }

  return (
    <FlatList
      style={styles.container}
      data={sortedByDate}
      keyExtractor={item => item.sentAt.toString()}
      ListHeaderComponent={
        <ListHeader
          name={metadata.name}
          domain={metadata.appDomain}
          imageUrl={metadata.icons[0]}
          description={metadata.description}
        />
      }
      ListHeaderComponentStyle={[
        styles.headerContainer,
        {borderBottomColor: Theme['gray-glass-020']},
      ]}
      onEndReached={handleLoadMoreNotifications}
      onRefresh={() => {
        setIsRefreshing(true);
        getNotificationHistory();
      }}
      refreshing={isRefreshing}
      ItemSeparatorComponent={Divider}
      ListEmptyComponent={<ListEmpty isLoading={isLoading} />}
      renderItem={({item}) => (
        <NotificationItem
          key={item.id}
          title={item.title}
          description={item.body}
          url={item.url}
          imageUrl={metadata.icons[0]}
          sentAt={item.sentAt}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 100,
    marginBottom: Spacing.xs,
  },
  domain: {
    marginBottom: Spacing.l,
  },
});
