import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/header';
import { useTheme } from '@/hooks/use-theme-color';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: Theme['bg-primary'],
        },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light']['icon-inverse'],
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light']['icon-default'],
        header: () => <Header />,
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
              style={[styles.tabBarIcon, { tintColor: color }]}
              cachePolicy="memory-disk"
              priority="high"
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
              style={[styles.tabBarIcon, { tintColor: color }]}
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
              style={[styles.tabBarIcon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarIcon: {
    width: 28,
    height: 28,
  },
});
