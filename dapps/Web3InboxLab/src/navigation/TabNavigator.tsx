import React from 'react';
import {PlatformColor} from 'react-native';
import CompassIcon from '../icons/compass';
import BellIcon from '../icons/bell';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import NotificationsStack from './NotificationsStack';
import DiscoverStack from './DiscoverStack';
import SubscriptionsStack from './SubscriptionsStack';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="NotificationsStack"
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({focused}) => (
            <BellIcon style={[{width: 15, height: 15}]} />
          ),
        }}
        component={NotificationsStack}
      />
      <Tab.Screen
        name="DiscoverStack"
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({focused}) => (
            <CompassIcon style={[{width: 15, height: 15}]} />
          ),
        }}
        component={DiscoverStack}
      />
      <Tab.Screen
        name="SubscriptionsStack"
        options={{
          tabBarLabel: 'Subscriptions',
          tabBarIcon: ({focused}) => (
            <BellIcon style={[{width: 15, height: 15}]} />
          ),
        }}
        component={SubscriptionsStack}
      />
    </Tab.Navigator>
  );
}
