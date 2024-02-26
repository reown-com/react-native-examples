import * as React from 'react';

import {FlatList} from 'react-native';

import DiscoverListItem from './DiscoverListItem';
import SubscriptionListTabHeader from '@/components/SubscriptionListTabHeader';
import {ProjectItem} from '@/constants/Explorer';

type DiscoverListProps = {
  data: ProjectItem[];
  page: number;
  setPage: (index: number) => void;
};

export default function DiscoverList({data, page, setPage}: DiscoverListProps) {
  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        gap: 16,
      }}
      ListHeaderComponent={
        <SubscriptionListTabHeader page={page} setPage={setPage} />
      }
      data={data}
      renderItem={({item}) => <DiscoverListItem item={item} />}
    />
  );
}
