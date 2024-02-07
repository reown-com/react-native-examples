import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DiscoverScreen from '../screens/DiscoverScreen';

const Stack = createNativeStackNavigator();

export default function DiscoverStack() {
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
