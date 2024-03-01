import React from 'react';
import InboxSvg from '@/icons/inbox-tab';
import DiscoverSvg from '@/icons/discover-tab';
import SettingsSvg from '@/icons/settings-tab';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DiscoverStack from './DiscoverStack';
import SubscriptionsStack from './SubscriptionsStack';
import useColors from '@/hooks/useColors';
import {HomeTabParamList} from '@/utils/TypesUtil';
import {SettingsScreen} from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const NotificationIcon = ({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) => <InboxSvg height={24} width={24} fill={color} focused={focused} />;

const DiscoverTab = ({color, focused}: {color: string; focused: boolean}) => (
  <DiscoverSvg height={24} width={24} fill={color} focused={focused} />
);

const SettingsTab = ({color, focused}: {color: string; focused: boolean}) => (
  <SettingsSvg height={24} width={24} fill={color} focused={focused} />
);

export default function TabNavigator() {
  const Theme = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Theme['inverse-000'],
        tabBarInactiveTintColor: Theme['fg-200'],
        tabBarStyle: {
          backgroundColor: Theme['bg-100'],
          borderTopColor: Theme['bg-125'],
        },
      }}>
      <Tab.Screen
        name="SubscriptionsStack"
        options={{tabBarIcon: NotificationIcon}}
        component={SubscriptionsStack}
      />
      <Tab.Screen
        name="DiscoverStack"
        options={{tabBarIcon: DiscoverTab}}
        component={DiscoverStack}
      />
      <Tab.Screen
        name="SettingsScreen"
        options={{tabBarIcon: SettingsTab}}
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}
