import * as React from 'react';
import {useNavigation} from '@react-navigation/native';
import {RefreshControl, ScrollView, Text, View} from 'react-native';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import SubscriptionItem from '../components/SubscriptionItem';
import SubscriptionsConnectOverlay from '../components/SubscriptionsConnectOverlay';

export default function SubscriptionsScreen() {
  const {subscriptions, fetchSubscriptions} = useNotifyClientContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const {navigate} = useNavigation();

  async function handleRefresh() {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
        gap: 8,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <SubscriptionsConnectOverlay />
      {subscriptions.map(item => (
        <SubscriptionItem
          key={item?.topic}
          title={item?.metadata?.name}
          imageURL={item?.metadata?.icons[0]}
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
