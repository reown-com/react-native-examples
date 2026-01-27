import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useTheme } from '@/hooks/useTheme';
import SvgConnectionsTab from '@/assets/ConnectionsTab';
import SvgSettingsTab from '@/assets/SettingsTab';
import SvgWalletTab from '@/assets/WalletTab';
import { HomeTabParamList } from '@/utils/TypesUtil';
import Wallets from '@/screens/Wallets';
import Connections from '@/screens/Connections';
import Settings from '@/screens/Settings';
import { Header } from '@/components/Header';
import { FontFamily, Spacing } from '@/utils/ThemeUtil';
import { Platform } from 'react-native';
import { haptics } from '@/utils/haptics';

const TabNav = createBottomTabNavigator<HomeTabParamList>();

const WalletsIcon = ({ color }: { color: string }) => (
  <SvgWalletTab height={24} width={24} fill={color} />
);

const ConnectionsIcon = ({ color }: { color: string }) => (
  <SvgConnectionsTab height={24} width={24} fill={color} />
);

const SettingsIcon = ({ color }: { color: string }) => (
  <SvgSettingsTab height={24} width={24} fill={color} />
);

const NavHeader = () => <Header />;

export function HomeTabNavigator() {
  const Theme = useTheme();

  return (
    <TabNav.Navigator
      screenListeners={{
        state: haptics.tabChange,
      }}
      screenOptions={{
        header: NavHeader,
        tabBarStyle: {
          backgroundColor: Theme['bg-primary'],
          borderColor: Theme['foreground-tertiary'],
          ...Platform.select({
            android: {
              height: 80,
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: FontFamily.regular,
        },
        tabBarItemStyle: {
          paddingTop: Spacing[2],
        },
        tabBarActiveTintColor: Theme['text-primary'],
        tabBarInactiveTintColor: Theme['text-secondary'],
        sceneStyle: {
          backgroundColor: Theme['bg-primary'],
        },
      }}
    >
      <TabNav.Screen
        name="Wallets"
        component={Wallets}
        options={{
          tabBarLabel: 'Wallets',
          tabBarIcon: WalletsIcon,
        }}
      />
      <TabNav.Screen
        name="Connections"
        component={Connections}
        options={{
          tabBarLabel: 'Connected Apps',
          tabBarIcon: ConnectionsIcon,
        }}
      />
      <TabNav.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </TabNav.Navigator>
  );
}
