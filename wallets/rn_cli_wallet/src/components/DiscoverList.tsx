import * as React from 'react';

import {ScrollView} from 'react-native';

import projectsData from '../constants/projects-resposne.json';
import DiscoverListItem from '../components/components/DiscoverListItem';

export default function DiscoverList() {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 16,
      }}>
      {projectsData.map(item => (
        <DiscoverListItem key={item.dapp_url} item={item} />
      ))}
    </ScrollView>
  );
}
