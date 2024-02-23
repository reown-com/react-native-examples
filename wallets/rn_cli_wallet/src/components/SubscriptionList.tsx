import * as React from 'react';
import {FlatList, RefreshControl, ScrollView} from 'react-native';

import {useSnapshot} from 'valtio';
import {useNavigation} from '@react-navigation/native';

import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import SubscriptionItem from '@/components/components/SubscriptionItem';
import SettingsStore from '@/store/SettingsStore';
import SubscriptionListTabHeader from '@/components/SubscriptionListTabHeader';

export default function SubscriptionList({page, setPage}) {
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
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={() => (
        <SubscriptionListTabHeader page={page} setPage={setPage} />
      )}
      data={address ? subscriptions : []}
      renderItem={({item}) => (
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
      )}
    />
  );
}
