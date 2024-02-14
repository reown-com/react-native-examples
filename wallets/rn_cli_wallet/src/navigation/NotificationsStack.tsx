import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {W3mAccountButton} from '@web3modal/wagmi-react-native';
import NotificationsScreen from '../components/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function NotificationsStack() {
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
