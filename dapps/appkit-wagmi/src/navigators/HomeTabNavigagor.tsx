import React from 'react';
import {Platform} from 'react-native';

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
      screenOptions={{
        sceneStyle: { backgroundColor: Theme['bg-100'] },
        headerShown: false,
        headerStyle: {
          backgroundColor: Theme['bg-100'],
        },
        tabBarStyle: {
          backgroundColor: Theme['bg-100'],
          borderColor: Theme['bg-300'],
          // Extra height + bottom padding so labels aren't clipped in the
          // desktop-web frame (no bottom safe-area inset there). Matches the
          // rn_cli_wallet HomeTabNavigator.web.tsx tab config.
          ...(Platform.OS === 'web'
            ? {height: 72, paddingTop: 4, paddingBottom: 16}
            : {}),
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
