import React from 'react';
import {RootStackParamList} from '@/utils/TypesUtil';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeTabNavigator} from '@/navigators/HomeTabNavigagor';
import {useTheme} from '@/hooks/useTheme';
import {useSocketStatus} from '@/hooks/useSocketStatus';

const StackNavigator = createNativeStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  const Theme = useTheme();
  useSocketStatus();

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
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
    </StackNavigator.Navigator>
  );
}
