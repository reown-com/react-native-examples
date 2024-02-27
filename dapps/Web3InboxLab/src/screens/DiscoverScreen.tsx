import {useEffect, useState} from 'react';

import {FlatList, StyleSheet} from 'react-native';
import DiscoverListItem from '../components/DiscoverListItem';

import {ProjectItem} from '@/constants/Explorer';
import {fetchFeaturedProjects} from '@/utils/NotifyClient';

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
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
      data={discoverList}
      renderItem={({item}) => (
        <DiscoverListItem key={item.dapp_url} item={item} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 8,
    padding: 16,
  },
});
