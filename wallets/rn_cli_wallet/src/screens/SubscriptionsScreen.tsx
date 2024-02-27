import {useEffect, useState} from 'react';

import SubscriptionList from '@/components/SubscriptionList';
import DiscoverList from '@/components/DiscoverList';
import {fetchFeaturedProjects} from '@/utils/NotifyClient';
import {ProjectItem} from '@/constants/Explorer';

export default function SubscriptionsScreen() {
  const [page, setPage] = useState(0);
  const [discoverList, setDiscoverList] = useState<ProjectItem[]>([]);

  async function handleGetDiscoverList() {
    const {data} = await fetchFeaturedProjects();
    setDiscoverList(data as ProjectItem[]);
  }

  useEffect(() => {
    handleGetDiscoverList();
  }, []);

  return (
    <>
      {page === 0 ? <SubscriptionList page={page} setPage={setPage} /> : null}
      {page === 1 ? (
        <DiscoverList data={discoverList} page={page} setPage={setPage} />
      ) : null}
    </>
  );
}
