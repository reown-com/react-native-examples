import {useSnapshot} from 'valtio';
import {FlatList, StyleSheet, TouchableOpacity} from 'react-native';

import SubscriptionItem from '@/components/SubscriptionItem';
import {
  AccountController,
  AccountControllerState,
} from '@/controllers/AccountController';
import {Divider} from '@/components/Divider';
import {HomeTabScreenProps} from '@/utils/TypesUtil';
import {Text} from '@/components/Text';
import {Spacing} from '@/utils/ThemeUtil';
import SubscriptionItemSkeleton from '@/components/SubscriptionItemSkeleton';
import DiscoverAppsIcon from '@/icons/all-apps';

function ListHeader(onPress: () => void, showSubscribed: boolean) {
  return (
    <>
      <Text variant="tiny-600" color="fg-300" style={styles.mainText}>
        Discover
      </Text>
      <TouchableOpacity onPress={onPress} style={styles.discoverButton}>
        <DiscoverAppsIcon width={24} height={24} />
        <Text variant="small-500">Discover apps</Text>
      </TouchableOpacity>
      {showSubscribed && (
        <Text variant="tiny-600" color="fg-300" style={styles.mainText}>
          Subscribed
        </Text>
      )}
    </>
  );
}

function ListEmptyComponent(isLoading: boolean) {
  if (isLoading) {
    return (
      <>
        <SubscriptionItemSkeleton />
        <SubscriptionItemSkeleton />
        <SubscriptionItemSkeleton />
      </>
    );
  }
  return null;
}

type Props = HomeTabScreenProps<'Subscriptions'>;

export default function SubscriptionsScreen({navigation}: Props) {
  const {subscriptions} = useSnapshot(
    AccountController.state,
  ) as AccountControllerState;

  const onDiscoverPress = () => {
    navigation.navigate('Discover');
  };

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={subscriptions}
      ItemSeparatorComponent={Divider}
      ListHeaderComponent={ListHeader.bind(
        null,
        onDiscoverPress,
        subscriptions.length > 0,
      )}
      ListHeaderComponentStyle={styles.header}
      ListEmptyComponent={ListEmptyComponent.bind(null, false)}
      renderItem={({item}) => (
        <SubscriptionItem
          key={item?.topic}
          title={item?.metadata?.name}
          imageURL={item?.metadata?.icons[0]}
          description={item?.metadata?.appDomain}
          onPress={() => {
            navigation.navigate('SubscriptionDetails', {
              topic: item?.topic,
              metadata: item?.metadata,
            });
          }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    rowGap: Spacing.s,
    padding: Spacing.m,
  },
  mainText: {
    textTransform: 'uppercase',
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: Spacing.s,
    marginVertical: Spacing.s,
  },
});
