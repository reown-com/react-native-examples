import React, {useEffect, useState} from 'react';

import SubscriptionList from '@/components/SubscriptionList';
import DiscoverList from '@/components/DiscoverList';
import {fetchFeaturedProjects} from '@/utils/NotifyClient';
import {ProjectItem} from '@/constants/Explorer';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTheme} from '@/hooks/useTheme';

export default function SubscriptionsScreen() {
  const [page, setPage] = useState(0);
  const [discoverList, setDiscoverList] = useState<ProjectItem[]>([]);
  const {isRegistered, notifyClient} = useNotifyClientContext();
  const Theme = useTheme();

  async function handleGetDiscoverList() {
    const {data} = await fetchFeaturedProjects();
    setDiscoverList(data as ProjectItem[]);
  }

  useEffect(() => {
    handleGetDiscoverList();
  }, []);

  if (!isRegistered || !notifyClient) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Theme['accent-100']} />
      </View>
    );
  }

  return (
    <>
      {page === 0 ? <SubscriptionList page={page} setPage={setPage} /> : null}
      {page === 1 ? (
        <DiscoverList data={discoverList} page={page} setPage={setPage} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
