import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useTheme} from '@/hooks/useTheme';
import ConnectionsScreen from '@/screens/ConnectionsScreen';
import {ConnectionsStackParamList} from '@/utils/TypesUtil';

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

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
        component={ConnectionsScreen}
      />
    </Stack.Navigator>
  );
}
