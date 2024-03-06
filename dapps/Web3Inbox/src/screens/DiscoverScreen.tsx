import {useSnapshot} from 'valtio';
import {useEffect, useState} from 'react';
import {FlatList, ImageBackground, StyleSheet} from 'react-native';
import {ProjectItem} from '@/constants/Explorer';
import DiscoverListItem from '@/components/DiscoverListItem';
import DiscoverSvg from '@/icons/discover-intro';
import {fetchFeaturedProjects} from '@/utils/NotifyClient';
import {Text} from '@/components/Text';
import Background from '@/icons/gradient-background.png';
import {Spacing} from '@/utils/ThemeUtil';
import DiscoverListItemSkeleton from '@/components/DiscoverListItemSkeleton';
import {AccountController} from '@/controllers/AccountController';
import {NotifyController} from '@/controllers/NotifyController';
import {NotifyClientTypes} from '@walletconnect/notify-client';

import {HomeTabScreenProps} from '@/utils/TypesUtil';

function ListHeader() {
  return (
    <>
      <DiscoverSvg />
      <Text variant="large-600" center>
        Discover Web3Inbox
      </Text>
      <Text variant="small-400" center color="fg-150">
        Subscribing to our available apps below to start receiving notifications
      </Text>
    </>
  );
}

function ListEmpty({isLoading}: {isLoading: boolean}) {
  if (isLoading) {
    return (
      <>
        <DiscoverListItemSkeleton />
        <DiscoverListItemSkeleton />
        <DiscoverListItemSkeleton />
      </>
    );
  }
  return null;
}

type Props = HomeTabScreenProps<'Discover'>;

export default function DiscoverScreen({navigation}: Props) {
  const {subscriptions, address} = useSnapshot(AccountController.state);
  const [discoverList, setDiscoverList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetDiscoverList = async () => {
    setLoading(true);
    const {data} = await fetchFeaturedProjects();
    setDiscoverList(data as ProjectItem[]);
    setLoading(false);
  };

  const handleSubscribe = async (domain: string) => {
    const client = NotifyController.getClient();
    if (!client || !address) {
      console.log('Notify client not initialized');
      return;
    }

    await client
      .subscribe({
        account: address,
        appDomain: domain,
      })
      .then(res => {
        if (res) {
          console.log('Subscribed to', domain, res);
        }
      })
      .catch(e => {
        console.log('Error subscribing to dapp', e.message);
      });
  };

  const handlePress = (item?: NotifyClientTypes.NotifySubscription) => {
    if (item) {
      navigation.navigate('SubscriptionDetails', {
        topic: item?.topic,
        metadata: item.metadata,
      });
    }
  };

  useEffect(() => {
    handleGetDiscoverList();
  }, []);

  return (
    <ImageBackground source={Background} style={styles.container}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={ListHeader}
        ListHeaderComponentStyle={styles.headerContainer}
        fadingEdgeLength={20}
        ListEmptyComponent={<ListEmpty isLoading={loading} />}
        data={discoverList}
        renderItem={({item}) => {
          const subscription = subscriptions.find(s =>
            item.dapp_url.includes(s.metadata.appDomain),
          ) as NotifyClientTypes.NotifySubscription;
          return (
            <DiscoverListItem
              key={item.dapp_url}
              item={item}
              isSubscribed={!!subscription}
              onSubscribe={handleSubscribe}
              onPress={() => handlePress(subscription)}
            />
          );
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  contentContainer: {
    gap: 8,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '15%',
    rowGap: Spacing.xs,
    marginBottom: Spacing['3xl'],
    paddingTop: Spacing['3xl'],
  },
});
