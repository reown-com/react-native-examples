import React from 'react';
import CompassIcon from '../icons/compass';
import BellIcon from '../icons/bell';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DiscoverStack from './DiscoverStack';
import SubscriptionsStack from './SubscriptionsStack';
import useColors from '@/utils/theme';
import HomeScreen from '@/screens/HomeScreen';

const Tab = createBottomTabNavigator();

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
        name="Home"
        options={{
          tabBarLabel: 'Connections',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarIcon: ({focused}) => (
            <BellIcon
              style={[
                {
                  width: 15,
                  height: 15,
                  fill: focused ? colors.primary : colors.secondary,
                },
              ]}
            />
          ),
        }}
        component={HomeScreen}
      />
      <Tab.Screen
        name="SubscriptionsStack"
        options={{
          tabBarLabel: 'Subscriptions',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarIcon: ({focused}) => (
            <BellIcon
              style={[
                {
                  width: 15,
                  height: 15,
                  fill: focused ? colors.primary : colors.secondary,
                },
              ]}
            />
          ),
        }}
        component={SubscriptionsStack}
      />
      <Tab.Screen
        name="DiscoverStack"
        options={{
          tabBarLabel: 'Discover',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarIcon: ({focused}) => (
            <CompassIcon
              style={[
                {
                  width: 15,
                  height: 15,
                  fill: focused ? colors.primary : colors.secondary,
                },
              ]}
            />
          ),
        }}
        component={DiscoverStack}
      />
    </Tab.Navigator>
  );
}
