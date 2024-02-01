import * as React from 'react';

import {Alert, FlatList, ScrollView, View} from 'react-native';
import DiscoverListItem from '../components/DiscoverListItem';

import projectsData from '../constants/projects-resposne.json';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

export default function DiscoverScreen() {
  const {top, bottom} = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flex: 1,
        padding: 16,
        gap: 16,
        backgroundColor: 'white',
      }}>
      {projectsData.map(item => (
        <DiscoverListItem item={item} />
      ))}
    </ScrollView>
  );
}
