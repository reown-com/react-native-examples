import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../hooks/useTheme';
import ConnectionsView from '../screens/ConnectionsView';
import SvgConnectionsTab from '../assets/ConnectionsTab';
import SettingsView from '../screens/SettingsView';
import SvgSettingsTab from '../assets/SettingsTab';
import {HomeTabParamList} from '../utils/TypesUtil';

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
        name="Connections"
        component={ConnectionsView}
        options={{
          tabBarIcon: ConnectionsIcon,
        }}
      />
      <TabNav.Screen
        name="Settings"
        component={SettingsView}
        options={{
          tabBarIcon: SettingsIcon,
        }}
      />
    </TabNav.Navigator>
  );
}
