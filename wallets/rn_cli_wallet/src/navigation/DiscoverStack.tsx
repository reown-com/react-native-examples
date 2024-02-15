import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DiscoverScreen from '@/screens/DiscoverScreen';
import useColors from '@/utils/theme';

const Stack = createNativeStackNavigator();

export default function DiscoverStack() {
  const colors = useColors();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: colors.backgroundSecondary},
        headerStyle: {backgroundColor: colors.background},
        headerTitleStyle: {
          color: colors.primary,
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
