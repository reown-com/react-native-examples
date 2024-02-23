import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../hooks/useTheme';
import SvgConnectionsTab from '../assets/ConnectionsTab';
import SvgSettingsTab from '../assets/SettingsTab';
import {HomeTabParamList} from '../utils/TypesUtil';
import SubscriptionsStack from '@/navigators/SubscriptionsStack';
import SettingsStack from '@/navigators/SettingsStack';
import ConnectionsStack from '@/navigators/ConnectionsStack';
import SvgBellIcon from '../../src/assets/BellIcon';

const TabNav = createBottomTabNavigator<HomeTabParamList>();

const SettingsIcon = ({color}: {color: string}) => (
  <SvgSettingsTab height={26} width={26} fill={color} />
);

const ConnectionsIcon = ({color}: {color: string}) => (
  <SvgConnectionsTab height={26} width={26} fill={color} />
);

const BellIcon = ({color}: {color: string}) => (
  <SvgBellIcon height={26} width={26} stroke={color} />
);

export function HomeTabNavigator() {
  const Theme = useTheme();

  return (
    <TabNav.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Theme['bg-100'],
        },
        tabBarStyle: {
          backgroundColor: Theme['bg-100'],
          borderColor: Theme['bg-300'],
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
        },
        tabBarActiveTintColor: Theme['fg-100'],
        tabBarInactiveTintColor: Theme['fg-300'],
      }}>
      <TabNav.Screen
        name="ConnectionsStack"
        component={ConnectionsStack}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ConnectionsIcon,
          headerStyle: {
            backgroundColor: Theme['bg-100'],
          },
        }}
      />
      <TabNav.Screen
        name="SubscriptionsStack"
        component={SubscriptionsStack}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: BellIcon,
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
