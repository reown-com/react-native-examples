import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light']['icon-inverse'],
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light']['icon-default'],
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarIconStyle: {
          marginBottom: Spacing['spacing-1'],
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallets',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/tabs/wallet.png')}
              style={{ width: 28, height: 28, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="connected-apps"
        options={{
          title: 'Connected Apps',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/tabs/stack.png')}
              style={{ width: 28, height: 28, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/tabs/gear.png')}
              style={{ width: 28, height: 28, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
