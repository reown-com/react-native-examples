// Web variant of HomeTabNavigator. The native build uses @bottom-tabs/react-navigation
// (react-native-bottom-tabs), which imports RN internals that don't exist on web,
// so on web we fall back to the JS @react-navigation/bottom-tabs.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import { HomeTabParamList } from '@/utils/TypesUtil';
import Wallets from '@/screens/Wallets';
import Connections from '@/screens/Connections';
import Settings from '@/screens/Settings';
import { useTheme } from '@/hooks/useTheme';

const TabNav = createBottomTabNavigator<HomeTabParamList>();

const tabIcon = (src: number) =>
  function TabIcon() {
    return (
      <Image
        source={src}
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
    );
  };

export function HomeTabNavigator() {
  const Theme = useTheme();

  return (
    <TabNav.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Theme['bg-primary'] },
        tabBarStyle: { backgroundColor: Theme['bg-primary'] },
      }}>
      <TabNav.Screen
        name="Wallets"
        component={Wallets}
        options={{
          tabBarLabel: 'Wallets',
          tabBarIcon: tabIcon(require('@/assets/icons/tab-wallet.svg')),
        }}
      />
      <TabNav.Screen
        name="Connections"
        component={Connections}
        options={{
          tabBarLabel: 'Connected apps',
          tabBarIcon: tabIcon(require('@/assets/icons/tab-connections.svg')),
        }}
      />
      <TabNav.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: tabIcon(require('@/assets/icons/tab-settings.svg')),
        }}
      />
    </TabNav.Navigator>
  );
}
