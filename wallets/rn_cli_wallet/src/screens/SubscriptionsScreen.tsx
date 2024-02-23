import * as React from 'react';

import SubscriptionList from '@/components/SubscriptionList';
import DiscoverList from '@/components/DiscoverList';

export default function SubscriptionsScreen() {
  const [page, setPage] = React.useState(1);

  return (
    <>
      {page === 0 ? <SubscriptionList page={page} setPage={setPage} /> : null}
      {page === 1 ? <DiscoverList page={page} setPage={setPage} /> : null}
    </>
  );
}
