import React from 'react';
import InboxSvg from '@/icons/inbox-tab';
import DiscoverSvg from '@/icons/discover-tab';
import SettingsSvg from '@/icons/settings-tab';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import useTheme from '@/hooks/useTheme';
import {HomeTabParamList} from '@/utils/TypesUtil';
import {SettingsScreen} from '@/screens/SettingsScreen';
import SubscriptionsScreen from '@/screens/SubscriptionsScreen';
import DiscoverScreen from '@/screens/DiscoverScreen';
import {TabHeader} from '@/components/TabHeader';
import {useAccount, useEnsAvatar, useEnsName} from 'wagmi';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  const Theme = useTheme();
  const {address} = useAccount();
  const insets = useSafeAreaInsets();
  const {data: ensName} = useEnsName({address});
  const {data: avatar} = useEnsAvatar({name: ensName});
  const {open} = useWeb3Modal();

  return (
    <Tab.Navigator
      backBehavior="none"
      sceneContainerStyle={{backgroundColor: Theme['bg-100']}}
      screenOptions={{
        header: props =>
          TabHeader({
            ...props,
            address: ensName || address,
            onAvatarPress: open,
            avatar,
            style: {marginTop: insets.top},
          }),
        tabBarShowLabel: false,
        tabBarActiveTintColor: Theme['fg-100'],
        tabBarInactiveTintColor: Theme['fg-200'],
        tabBarStyle: {
          backgroundColor: Theme['bg-100'],
          borderTopColor: Theme['bg-125'],
        },
      }}>
      <Tab.Screen
        name="Subscriptions"
        options={{tabBarIcon: NotificationIcon, title: 'Notifications'}}
        component={SubscriptionsScreen}
      />
      <Tab.Screen
        name="Discover"
        options={{tabBarIcon: DiscoverTab, title: 'Discover'}}
        component={DiscoverScreen}
      />
      <Tab.Screen
        name="Settings"
        options={{tabBarIcon: SettingsTab, title: 'Settings'}}
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}
