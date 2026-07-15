import React from 'react';
import {RootStackParamList} from '@/utils/TypesUtil';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeTabNavigator} from '@/navigators/HomeTabNavigagor';
import {useTheme} from '@/hooks/useTheme';
import {useSocketStatus} from '@/hooks/useSocketStatus';
import {LogList} from '@/screens/LogList';
import {useLogs} from '@/hooks/useLogs';
import { AppKitLogList } from '@/screens/AppKitLogList';
import NetworkSettingsScreen from '@/screens/NetworkSettings';
import PayWebView from '@/screens/PayWebView';
import OmenScreen from '@/screens/Omen';
import OmenDepositWebView from '@/screens/Omen/OmenDepositWebView';

const StackNavigator = createNativeStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  const Theme = useTheme();
  useSocketStatus();
  useLogs();

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          color: Theme['fg-100'],
        },
        headerStyle: {
          backgroundColor: Theme['bg-100'],
        },
      }}>
      <StackNavigator.Screen
        name="Home"
        component={HomeTabNavigator}
        options={{
          headerStyle: {
            backgroundColor: Theme['bg-100'],
          },
        }}
      />
      <StackNavigator.Screen
        name="Logs"
        component={LogList}
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: 'Logs',
          headerTintColor: Theme['fg-100'],
        }}
      />
      <StackNavigator.Screen
        name="AppKitLogs"
        component={AppKitLogList}
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: 'AppKit Logs',
        }}
      />
      <StackNavigator.Screen
        name="NetworkSettings"
        component={NetworkSettingsScreen}
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: 'AppKit settings & networks',
          headerTintColor: Theme['fg-100'],
        }}
      />
      <StackNavigator.Screen
        name="PayWebView"
        component={PayWebView}
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: 'Payment',
          headerTintColor: Theme['fg-100'],
        }}
      />
      <StackNavigator.Screen
        name="Omen"
        component={OmenScreen}
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: 'Omen',
          headerTintColor: Theme['fg-100'],
        }}
      />
      <StackNavigator.Screen
        name="OmenDepositWebView"
        component={OmenDepositWebView}
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: 'Add money',
          headerTintColor: Theme['fg-100'],
        }}
      />
    </StackNavigator.Navigator>
  );
}
