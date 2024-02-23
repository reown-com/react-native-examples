import * as React from 'react';

import {FlatList} from 'react-native';

import projectsData from '../constants/projects-response.json';
import DiscoverListItem from '../components/components/DiscoverListItem';
import SubscriptionListTabHeader from '@/components/SubscriptionListTabHeader';

type DiscoverListProps = {
  page: number;
  setPage: (index: number) => void;
};

export default function DiscoverList({page, setPage}: DiscoverListProps) {
  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        gap: 16,
      }}
      ListHeaderComponent={() => (
        <SubscriptionListTabHeader page={page} setPage={setPage} />
      )}
      data={projectsData}
      renderItem={({item}) => <DiscoverListItem item={item} />}
    />
  );
}
