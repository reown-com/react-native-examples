import * as React from 'react';
import {RefreshControl, ScrollView} from 'react-native';

import {useSnapshot} from 'valtio';
import {useNavigation} from '@react-navigation/native';

import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import SubscriptionItem from '@/components/components/SubscriptionItem';
import SettingsStore from '@/store/SettingsStore';

export default function SubscriptionList() {
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
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
