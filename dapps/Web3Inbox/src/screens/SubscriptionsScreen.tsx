import * as React from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlatList, RefreshControl, View} from 'react-native';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import SubscriptionItem from '../components/SubscriptionItem';
import SubscriptionsConnectOverlay from '../components/SubscriptionsConnectOverlay';
import {useAccount} from 'wagmi';
import useColors from '@/hooks/useColors';

export default function SubscriptionsScreen() {
  const {subscriptions, isRegistered, fetchSubscriptions} =
    useNotifyClientContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const {address} = useAccount();
  const {navigate} = useNavigation();
  const colors = useColors();

  async function handleRefresh() {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }

  if (!address || !isRegistered) {
    return <SubscriptionsConnectOverlay />;
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      data={subscriptions}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: 1,
            width: '100%',
            backgroundColor: colors.border,
          }}
        />
      )}
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
