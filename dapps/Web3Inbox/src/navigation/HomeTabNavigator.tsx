import React from 'react';
import CompassIconSVG from '../icons/compass';
import BellIconSVG from '../icons/bell';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DiscoverStack from './DiscoverStack';
import SubscriptionsStack from './SubscriptionsStack';
import useColors from '@/hooks/useColors';
import {HomeTabParamList} from '@/utils/TypesUtil';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const BellIcon = ({color}: {color: string}) => (
  <BellIconSVG height={15} width={15} fill={color} />
);

const CompassIcon = ({color}: {color: string}) => (
  <CompassIconSVG height={15} width={26} fill={color} />
);

export default function TabNavigator() {
  const Theme = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme['bg-100'],
          borderTopColor: Theme['bg-125'],
        },
      }}>
      <Tab.Screen
        name="SubscriptionsStack"
        options={{
          tabBarLabel: 'Subscriptions',
          tabBarActiveTintColor: Theme['inverse-000'],
          tabBarInactiveTintColor: Theme['bg-200'],
          tabBarIcon: BellIcon,
        }}
        component={SubscriptionsStack}
      />
      <Tab.Screen
        name="DiscoverStack"
        options={{
          tabBarLabel: 'Discover',
          tabBarActiveTintColor: Theme['inverse-000'],
          tabBarInactiveTintColor: Theme['bg-200'],
          tabBarIcon: CompassIcon,
        }}
        component={DiscoverStack}
      />
    </Tab.Navigator>
  );
}
