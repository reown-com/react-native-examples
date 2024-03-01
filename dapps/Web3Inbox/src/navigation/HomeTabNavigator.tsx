import React from 'react';
import InboxSvg from '@/icons/inbox-tab';
import DiscoverSvg from '@/icons/discover-tab';
import SettingsSvg from '@/icons/settings-tab';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import useColors from '@/hooks/useColors';
import {HomeTabParamList} from '@/utils/TypesUtil';
import {SettingsScreen} from '@/screens/SettingsScreen';
import SubscriptionsScreen from '@/screens/SubscriptionsScreen';
import DiscoverScreen from '@/screens/DiscoverScreen';

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
      backBehavior="none"
      sceneContainerStyle={{backgroundColor: Theme['bg-100']}}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Theme['fg-100'],
        tabBarInactiveTintColor: Theme['fg-200'],
        tabBarStyle: {
          backgroundColor: Theme['bg-100'],
          borderTopColor: Theme['bg-125'],
        },
      }}>
      <Tab.Screen
        name="SubscriptionsScreen"
        options={{tabBarIcon: NotificationIcon}}
        component={SubscriptionsScreen}
      />
      <Tab.Screen
        name="DiscoverScreen"
        options={{tabBarIcon: DiscoverTab}}
        component={DiscoverScreen}
      />
      <Tab.Screen
        name="SettingsScreen"
        options={{tabBarIcon: SettingsTab}}
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}
