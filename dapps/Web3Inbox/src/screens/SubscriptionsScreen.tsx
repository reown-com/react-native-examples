import {useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAccount} from 'wagmi';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import SubscriptionItem from '../components/SubscriptionItem';
import useColors from '@/hooks/useColors';

export default function SubscriptionsScreen() {
  const {subscriptions, isRegistered, fetchSubscriptions} =
    useNotifyClientContext();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const {address} = useAccount();

  const Theme = useColors();

  async function handleRefresh() {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }

  if (!address || !isRegistered) {
    return null;
  }

  const renderDivider = () => (
    <View style={[styles.divider, {backgroundColor: Theme['fg-125']}]} />
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
            navigation.navigate('SubscriptionDetailsScreen', {
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
