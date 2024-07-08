import React from 'react';
import {RootStackParamList} from '@/utils/TypesUtil';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeTabNavigator} from '@/navigators/HomeTabNavigagor';
import {useTheme} from '@/hooks/useTheme';
import {useSocketStatus} from '@/hooks/useSocketStatus';
import {LogList} from '@/screens/LogList';
import {useLogs} from '@/hooks/useLogs';

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
          headerBackTitleVisible: false,
          title: 'Logs',
        }}
      />
    </StackNavigator.Navigator>
  );
}
