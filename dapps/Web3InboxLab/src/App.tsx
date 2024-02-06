import '@walletconnect/react-native-compat';
import React, {useEffect} from 'react';
import {
  Alert,
  Linking,
  PlatformColor,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
  W3mButton,
  W3mAccountButton,
} from '@web3modal/wagmi-react-native';

import {CoinbaseWagmiConnector} from '@web3modal/coinbase-react-native';
import {FlexView, Text} from '@web3modal/ui-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import WalletIcon from './icons/wallet';
import CompassIcon from './icons/compass';
import BellIcon from './icons/bell';
import * as Sentry from '@sentry/react-native';

import {WagmiConfig} from 'wagmi';
import {
  arbitrum,
  mainnet,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
} from 'wagmi/chains';
import {ENV_PROJECT_ID, ENV_SENTRY_DSN} from '@env';
import {SignMessage} from './views/SignMessage';
import {SendTransaction} from './views/SendTransaction';
import {ReadContract} from './views/ReadContract';
import {handleResponse} from '@coinbase/wallet-mobile-sdk';
import {WriteContract} from './views/WriteContract';
import {InitializeNotifyClientButton} from './components/InitializeNotifyClientButton';
import {
  NavigationContainer,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NotifyClientProvider} from './provider/NotifyClientProvider';
import SubscriptionSettingsScreen from './screens/SubscriptionSettingsScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import SubscriptionDetailsScreen from './screens/SubscriptionDetailsScreen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import NotificationsScreen from './components/NotificationsScreen';

const Stack = createNativeStackNavigator();

if (!__DEV__ && ENV_SENTRY_DSN) {
  Sentry.init({
    dsn: ENV_SENTRY_DSN,
  });
}

// 1. Get projectId
const projectId = ENV_PROJECT_ID;

// 2. Create config
const metadata = {
  name: 'Web3Modal + wagmi',
  description: 'Web3Modal + wagmi',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'w3mwagmisample://',
  },
};

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const chains = [
  mainnet,
  polygon,
  arbitrum,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
];

const coinbaseConnector = new CoinbaseWagmiConnector({
  chains,
  options: {
    redirect: metadata?.redirect?.native || '',
  },
});

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [coinbaseConnector],
});

const colors = {
  primary: '#1e293b',
  secondary: '#475569',
  background: '#f1f5f9',
  backgroundActive: '#e2e8f0',
  border: '#cbd5e1',
};

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  clipboardClient,
});

function ConnectScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FlexView style={styles.buttonContainer}>
        <W3mButton balance="show" />
        <InitializeNotifyClientButton />
        <SignMessage />
        <SendTransaction />
        <ReadContract />
        <WriteContract />
      </FlexView>
    </View>
  );
}

function DiscoverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: 'white'},
      }}>
      <Stack.Screen
        name="DiscoverScreen"
        options={{headerTitle: 'Discover', headerLargeTitle: true}}
        component={DiscoverScreen}
      />
    </Stack.Navigator>
  );
}

function NotificationsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: 'white'},
        headerRight: () => <W3mAccountButton />,
      }}>
      <Stack.Screen
        name="NotificationsScreen"
        options={{headerTitle: 'Notifications', headerLargeTitle: true}}
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
}

function SubscriptionsStack() {
  const {navigate} = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: 'white'},
      }}>
      <Stack.Screen
        name="SubscriptionsScreen"
        options={{
          headerTitle: 'Subscriptions',
          headerLargeTitle: true,
        }}
        component={SubscriptionsScreen}
      />
      <Stack.Screen
        name="SubscriptionDetailsScreen"
        component={SubscriptionDetailsScreen}
        options={({route}) => ({
          title: route?.params?.name,
          headerRight: ({}) => (
            <Pressable
              onPress={() => {
                navigate('SubscriptionSettingsScreen', {
                  topic: route?.params.topic,
                  name: route.params?.name,
                });
              }}>
              <Text
                style={{
                  fontSize: 18,
                  letterSpacing: 0.2,
                  fontWeight: 400,
                  color: PlatformColor('linkColor'),
                }}>
                Settings
              </Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerLargeTitle: true,
          headerBackTitle: 'Back',
        }}
        name="SubscriptionSettingsScreen"
        component={SubscriptionSettingsScreen}
      />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // 4. Handle deeplinks for Coinbase SDK
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({url}) => {
      const handledBySdk = handleResponse(new URL(url));
      if (!handledBySdk) {
        // Handle other deeplinks
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{flex: 1}}>
        <WagmiConfig config={wagmiConfig}>
          <NotifyClientProvider>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <Tab.Navigator screenOptions={{headerShown: false}}>
              <Tab.Screen
                name="NotificationsStack"
                options={{
                  tabBarLabel: 'Notifications',
                  tabBarIcon: ({focused}) => (
                    <BellIcon
                      style={[
                        {width: 15, height: 15},
                        focused
                          ? {fill: PlatformColor('systemBlue')}
                          : {fill: PlatformColor('systemGray')},
                      ]}
                    />
                  ),
                }}
                component={NotificationsStack}
              />
              <Tab.Screen
                name="DiscoverStack"
                options={{
                  tabBarLabel: 'Discover',
                  tabBarIcon: ({focused}) => (
                    <CompassIcon
                      style={[
                        {width: 15, height: 15},
                        focused
                          ? {fill: PlatformColor('systemBlue')}
                          : {fill: PlatformColor('systemGray')},
                      ]}
                    />
                  ),
                }}
                component={DiscoverStack}
              />
              <Tab.Screen
                name="SubscriptionsStack"
                options={{
                  tabBarLabel: 'Subscriptions',
                  tabBarIcon: ({focused}) => (
                    <BellIcon
                      style={[
                        {width: 15, height: 15},
                        focused
                          ? {fill: PlatformColor('systemBlue')}
                          : {fill: PlatformColor('systemGray')},
                      ]}
                    />
                  ),
                }}
                component={SubscriptionsStack}
              />
            </Tab.Navigator>
            <Web3Modal />
          </NotifyClientProvider>
        </WagmiConfig>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    gap: 4,
  },
  dark: {
    backgroundColor: '#141414',
  },
  title: {
    marginBottom: 40,
    fontSize: 30,
  },
});

export default App;
