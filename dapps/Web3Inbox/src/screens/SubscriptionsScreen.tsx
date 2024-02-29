import {useEffect, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import {useAccount} from 'wagmi';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import SubscriptionItem from '../components/SubscriptionItem';
import SubscriptionsConnectOverlay from '../components/SubscriptionsConnectOverlay';
import useColors from '@/hooks/useColors';
import ConnectOverlay from '@/components/ConnectOverlay';

export default function SubscriptionsScreen() {
  const {subscriptions, isRegistered, fetchSubscriptions} =
    useNotifyClientContext();
  const [refreshing, setRefreshing] = useState(false);
  const {address} = useAccount();
  const {navigate} = useNavigation();
  const colors = useColors();

  async function handleRefresh() {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }

  useEffect(() => {
    // hide after init
    BootSplash.hide({fade: true});
  }, []);

  if (!address) {
    return <ConnectOverlay />;
  }

  if (!isRegistered) {
    return <SubscriptionsConnectOverlay />;
  }

  const renderDivider = () => (
    <View style={[styles.divider, {backgroundColor: colors.border}]} />
  );

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      data={subscriptions}
      ItemSeparatorComponent={renderDivider}
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

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
