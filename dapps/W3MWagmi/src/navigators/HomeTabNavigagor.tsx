import React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SvgConnectionsTab from '@/assets/ConnectionsTab';
import SvgSettingsTab from '@/assets/SettingsTab';
import {HomeTabParamList} from '@/utils/TypesUtil';
import ConnectionsScreen from '@/screens/Connections';
import {useTheme} from '@/hooks/useTheme';
import SettingsScreen from '@/screens/Settings';

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
      sceneContainerStyle={{backgroundColor: Theme['bg-100']}}
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
        name="ConnectionsScreen"
        component={ConnectionsScreen}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ConnectionsIcon,
          headerStyle: {
            backgroundColor: Theme['bg-100'],
          },
        }}
      />
      <TabNav.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </TabNav.Navigator>
  );
}
