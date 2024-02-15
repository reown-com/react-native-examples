import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import useColors from '../utils/theme';
import ConnectionsView from '@/screens/ConnectionsView';
import {useTheme} from '@/hooks/useTheme';

const Stack = createNativeStackNavigator();

export default function ConnectionsStack() {
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Theme['inverse-100']},
        headerStyle: {backgroundColor: Theme['inverse-100']},
        headerTitleStyle: {
          color: Theme['fg-100'],
        },
      }}>
      <Stack.Screen
        name="ConnectionsScreen"
        options={{headerTitle: 'Connections', headerLargeTitle: true}}
        component={ConnectionsView}
      />
    </Stack.Navigator>
  );
}
