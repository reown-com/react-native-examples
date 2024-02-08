import * as React from 'react';

import {ScrollView} from 'react-native';
import DiscoverListItem from '../components/DiscoverListItem';

import projectsData from '../constants/projects-resposne.json';

export default function DiscoverScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
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
