import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { Platform } from 'react-native';

import { HomeTabParamList } from '@/utils/TypesUtil';
import Wallets from '@/screens/Wallets';
import Connections from '@/screens/Connections';
import Explore from '@/screens/Explore';
import Settings from '@/screens/Settings';
import { useTheme } from '@/hooks/useTheme';

const TabNav = createNativeBottomTabNavigator<HomeTabParamList>();

const tabWalletIcon = Platform.select({
  ios: { sfSymbol: 'wallet.bifold.fill' },
  default: require('@/assets/icons/tab-wallet.svg'),
});

const tabConnectionsIcon = Platform.select({
  ios: { sfSymbol: 'square.stack.3d.up.fill' },
  default: require('@/assets/icons/tab-connections.svg'),
});

const tabExploreIcon = Platform.select({
  ios: { sfSymbol: 'safari.fill' },
  // POC corner cut: reuse the connections svg on Android
  default: require('@/assets/icons/tab-connections.svg'),
});

const tabSettingsIcon = Platform.select({
  ios: { sfSymbol: 'gearshape.fill' },
  default: require('@/assets/icons/tab-settings.svg'),
});

export function HomeTabNavigator() {
  const Theme = useTheme();

  const sceneStyle = Platform.select({
    android: {
      backgroundColor: Theme['bg-primary'],
      borderBottomWidth: 1,
      borderBottomColor: Theme['border-primary'],
    },
    default: { backgroundColor: Theme['bg-primary'] },
  });

  return (
    <TabNav.Navigator
      hapticFeedbackEnabled
      translucent={false}
      activeIndicatorColor={Theme['foreground-accent-primary-10-solid']}
      tabBarStyle={{ backgroundColor: Theme['bg-primary'] }}
    >
      <TabNav.Screen
        name="Wallets"
        component={Wallets}
        options={{
          tabBarLabel: 'Wallets',
          tabBarIcon: () => tabWalletIcon,
          sceneStyle,
        }}
      />
      <TabNav.Screen
        name="Connections"
        component={Connections}
        options={{
          tabBarLabel: 'Connected apps',
          tabBarIcon: () => tabConnectionsIcon,
          lazy: false,
          sceneStyle,
        }}
      />
      <TabNav.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: () => tabExploreIcon,
          sceneStyle,
        }}
      />
      <TabNav.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: () => tabSettingsIcon,
          lazy: false,
          sceneStyle,
        }}
      />
    </TabNav.Navigator>
  );
}
