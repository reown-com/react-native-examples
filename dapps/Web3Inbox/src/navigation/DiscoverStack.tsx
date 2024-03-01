import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DiscoverScreen from '../screens/DiscoverScreen';
import useColors from '@/hooks/useColors';

const Stack = createNativeStackNavigator();

export default function DiscoverStack() {
  const Theme = useColors();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Theme['bg-125']},
        headerStyle: {backgroundColor: Theme['bg-100']},
        headerTitleStyle: {
          color: Theme['inverse-000'],
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
