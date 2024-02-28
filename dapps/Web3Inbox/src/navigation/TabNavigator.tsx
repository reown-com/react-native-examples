import React from 'react';
import CompassIconSVG from '../icons/compass';
import BellIconSVG from '../icons/bell';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DiscoverStack from './DiscoverStack';
import SubscriptionsStack from './SubscriptionsStack';
import useColors from '@/hooks/useColors';

const Tab = createBottomTabNavigator();

const BellIcon = ({color}: {color: string}) => (
  <BellIconSVG height={15} width={15} fill={color} />
);

const CompassIcon = ({color}: {color: string}) => (
  <CompassIconSVG height={15} width={26} fill={color} />
);

export default function TabNavigator() {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}>
      <Tab.Screen
        name="SubscriptionsStack"
        options={{
          tabBarLabel: 'Subscriptions',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarIcon: BellIcon,
        }}
        component={SubscriptionsStack}
      />
      <Tab.Screen
        name="DiscoverStack"
        options={{
          tabBarLabel: 'Discover',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarIcon: CompassIcon,
        }}
        component={DiscoverStack}
      />
    </Tab.Navigator>
  );
}
