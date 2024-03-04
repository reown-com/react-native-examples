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
import useNotifyClientContext from '@/hooks/useNotifyClientContext';

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

export default function DiscoverScreen() {
  const {subscriptions, notifyClient, account} = useNotifyClientContext();
  const [discoverList, setDiscoverList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetDiscoverList = async () => {
    setLoading(true);
    const {data} = await fetchFeaturedProjects();
    setDiscoverList(data as ProjectItem[]);
    setLoading(false);
  };

  const handleSubscribe = async (domain: string) => {
    if (!notifyClient || !account) {
      return;
    }

    await notifyClient
      .subscribe({
        account,
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
          const isSubscribed = subscriptions.some(s =>
            item.dapp_url.includes(s.metadata.appDomain),
          );
          return (
            <DiscoverListItem
              key={item.dapp_url}
              item={item}
              isSubscribed={isSubscribed}
              onSubscribe={handleSubscribe}
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
