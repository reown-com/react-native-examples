import * as React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Alert, RefreshControl, ScrollView, Text, View} from 'react-native';
import useNotifyClient from '../hooks/useNotifyClient';
import SubscriptionItem from '../components/SubscriptionItem';
import {FlatList} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

export default function SubscriptionsScreen() {
  const {account, subscriptions, fetchSubscriptions, notifyClient} =
    useNotifyClient();
  const [refreshing, setRefreshing] = React.useState(false);
  const {navigate} = useNavigation();
  const {top, bottom} = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  async function handleRefresh() {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flex: 1,
        padding: 16,
        gap: 16,
        backgroundColor: 'white',
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      {subscriptions.map(item => (
        <SubscriptionItem
          key={item?.topic}
          title={item?.metadata?.name}
          description={item?.metadata?.appDomain}
          onPress={() => {
            navigate('SubscriptionDetailsScreen', {
              topic: item?.topic,
              name: item?.metadata?.name,
            });
          }}
        />
      ))}
    </ScrollView>
  );
}
