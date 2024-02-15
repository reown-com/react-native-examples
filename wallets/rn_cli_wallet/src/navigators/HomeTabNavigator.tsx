import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../hooks/useTheme';
import SvgConnectionsTab from '../assets/ConnectionsTab';
import SvgSettingsTab from '../assets/SettingsTab';
import {HomeTabParamList} from '../utils/TypesUtil';
import SubscriptionsStack from '@/navigators/SubscriptionsStack';
import SettingsStack from '@/navigators/SettingsStack';
import ConnectionsStack from '@/navigators/ConnectionsStack';

const TabNav = createBottomTabNavigator<HomeTabParamList>();

const SettingsIcon = ({color}: {color: string}) => (
  <SvgSettingsTab height={26} width={26} fill={color} />
);

const ConnectionsIcon = ({color}: {color: string}) => (
  <SvgConnectionsTab height={26} width={26} fill={color} />
);

export function HomeTabNavigator() {
  const Theme = useTheme();

  return (
    <TabNav.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {fontWeight: '500', fontSize: 12},
        tabBarActiveTintColor: Theme['fg-100'],
        tabBarInactiveTintColor: Theme['fg-300'],
      }}>
      <TabNav.Screen
        name="ConnectionsStack"
        component={ConnectionsStack}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ConnectionsIcon,
        }}
      />
      <TabNav.Screen
        name="SubscriptionsStack"
        component={SubscriptionsStack}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ConnectionsIcon,
        }}
      />
      <TabNav.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </TabNav.Navigator>
  );
}
