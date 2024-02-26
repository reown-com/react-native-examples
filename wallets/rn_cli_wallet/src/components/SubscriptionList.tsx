import * as React from 'react';
import {FlatList, RefreshControl} from 'react-native';

import {useSnapshot} from 'valtio';
import {useNavigation} from '@react-navigation/native';

import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import SubscriptionItem from '@/components/SubscriptionItem';
import SettingsStore from '@/store/SettingsStore';
import SubscriptionListTabHeader from '@/components/SubscriptionListTabHeader';

type SubscriptionListProps = {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

export default function SubscriptionList({
  page,
  setPage,
}: SubscriptionListProps) {
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
      ListHeaderComponent={
        <SubscriptionListTabHeader page={page} setPage={setPage} />
      }
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
