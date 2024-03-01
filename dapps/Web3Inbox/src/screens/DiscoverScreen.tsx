import {useEffect, useState} from 'react';

import {FlatList, ImageBackground, StyleSheet} from 'react-native';
import {ProjectItem} from '@/constants/Explorer';
import DiscoverListItem from '@/components/DiscoverListItem';
import DiscoverSvg from '@/icons/discover-intro';
import {fetchFeaturedProjects} from '@/utils/NotifyClient';
import {Text} from '@/components/Text';
import Background from '@/icons/gradient-background.png';
import {Spacing} from '@/utils/ThemeUtil';

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

export default function DiscoverScreen() {
  const [discoverList, setDiscoverList] = useState<ProjectItem[]>([]);

  async function handleGetDiscoverList() {
    const {data} = await fetchFeaturedProjects();
    setDiscoverList(data as ProjectItem[]);
  }

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
        data={discoverList}
        renderItem={({item}) => (
          <DiscoverListItem key={item.dapp_url} item={item} />
        )}
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
