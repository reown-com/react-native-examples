import * as React from 'react';
import {useNavigation} from '@react-navigation/native';
import {RefreshControl, ScrollView} from 'react-native';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import SubscriptionItem from '@/components/components/SubscriptionItem';
import SubscriptionsConnectOverlay from '@/components/components/SubscriptionsConnectOverlay';
import {useSnapshot} from 'valtio';
import SettingsStore from '@/store/SettingsStore';
// import {useAccount} from 'wagmi';

export default function SubscriptionsScreen() {
  const {subscriptions, fetchSubscriptions} = useNotifyClientContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const {eip155Address: address} = useSnapshot(SettingsStore.state);
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
      {address &&
        subscriptions.map(item => (
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
