import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DiscoverScreen from '@/screens/DiscoverScreen';

import {useTheme} from '@/hooks/useTheme';

const Stack = createNativeStackNavigator();

export default function DiscoverStack() {
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Theme['accent-090']},
        headerStyle: {backgroundColor: Theme['accent-100']},
        headerTitleStyle: {
          color: Theme['accent-100'],
        },
      }}>
      <Stack.Screen
        name="DiscoverScreen"
        options={{headerTitle: 'Discover', headerLargeTitle: true}}
        component={DiscoverScreen}
      />
    </Stack.Navigator>
  );
}
