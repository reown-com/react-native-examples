import React from 'react';
import CompassIcon from '../icons/compass';
import BellIcon from '../icons/bell';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DiscoverStack from './DiscoverStack';
import SubscriptionsStack from './SubscriptionsStack';

import HomeScreen from '@/screens/HomeScreen';
import {useTheme} from '@/hooks/useTheme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const Theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme['accent-100'],
          borderTopColor: Theme['gray-glass-020'],
        },
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Connections',
          tabBarActiveTintColor: Theme['accent-100'],
          tabBarInactiveTintColor: Theme['fg-200'],
          tabBarIcon: ({focused}) => (
            <BellIcon
              style={[
                {
                  width: 15,
                  height: 15,
                  fill: focused ? Theme['accent-100'] : Theme['fg-200'],
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
          tabBarActiveTintColor: Theme['accent-100'],
          tabBarInactiveTintColor: Theme['fg-200'],
          tabBarIcon: ({focused}) => (
            <BellIcon
              style={[
                {
                  width: 15,
                  height: 15,
                  fill: focused ? Theme['accent-100'] : Theme['fg-200'],
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
          tabBarActiveTintColor: Theme['accent-100'],
          tabBarInactiveTintColor: Theme['fg-200'],
          tabBarIcon: ({focused}) => (
            <CompassIcon
              style={[
                {
                  width: 15,
                  height: 15,
                  fill: focused ? Theme['accent-100'] : Theme['fg-200'],
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
