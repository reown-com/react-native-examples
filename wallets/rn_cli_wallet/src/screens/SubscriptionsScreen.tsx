import * as React from 'react';

import PagerView from 'react-native-pager-view';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@/hooks/useTheme';
import {Pressable, Text, View} from 'react-native';
import SubscriptionList from '@/components/SubscriptionList';
import DiscoverList from '@/components/DiscoverList';

export default function SubscriptionsScreen() {
  const viewPager = React.createRef<PagerView>();
  const headerHeight = useHeaderHeight();
  const {top} = useSafeAreaInsets();
  const Theme = useTheme();
  const [page, setPage] = React.useState(0);

  function handleSetPage(index: number) {
    viewPager.current?.setPage(index);
    setPage(index);
  }

  return (
    <View
      style={{
        paddingTop: headerHeight + top - 8,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: Theme['accent-glass-005'],
          borderBottomWidth: 0.5,
          borderColor: Theme['gray-glass-010'],
        }}>
        <Pressable
          style={{paddingHorizontal: 16, paddingVertical: 8}}
          onPress={() => {
            handleSetPage(0);
          }}>
          <Text
            style={{
              color: page === 0 ? Theme['accent-100'] : Theme['gray-glass-030'],
            }}>
            Subscriptions
          </Text>
        </Pressable>
        <Pressable
          style={{paddingHorizontal: 16, paddingVertical: 8}}
          onPress={() => {
            handleSetPage(1);
          }}>
          <Text
            style={{
              color: page === 1 ? Theme['accent-100'] : Theme['gray-glass-030'],
            }}>
            Discover
          </Text>
        </Pressable>
      </View>
      <PagerView
        ref={viewPager}
        style={{
          flex: 1,
        }}
        initialPage={0}>
        <View key="0">
          <SubscriptionList />
        </View>
        <View key="1">
          <DiscoverList />
        </View>
      </PagerView>
    </View>
  );
}
