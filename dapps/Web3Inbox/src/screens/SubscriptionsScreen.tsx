import {useSnapshot} from 'valtio';
import {FlatList} from 'react-native';
import {useAccount} from 'wagmi';

import SubscriptionItem from '@/components/SubscriptionItem';
import {AccountController} from '@/controllers/AccountController';
import {Divider} from '@/components/Divider';

export default function SubscriptionsScreen({navigation}) {
  const {subscriptions, isRegistered} = useSnapshot(AccountController.state);
  const {address} = useAccount();

  if (!address || !isRegistered) {
    return null;
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={subscriptions}
      ItemSeparatorComponent={Divider}
      renderItem={({item}) => (
        <SubscriptionItem
          key={item?.topic}
          title={item?.metadata?.name}
          imageURL={item?.metadata?.icons[0]}
          description={item?.metadata?.appDomain}
          onPress={() => {
            navigation.navigate('SubscriptionDetailsScreen', {
              topic: item?.topic,
              metadata: item?.metadata?.name,
            });
          }}
        />
      )}
    />
  );
}
