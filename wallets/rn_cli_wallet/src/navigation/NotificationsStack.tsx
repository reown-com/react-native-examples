import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotificationsScreen from '@/components/components/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function NotificationsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: 'white'},
      }}>
      <Stack.Screen
        name="NotificationsScreen"
        options={{headerTitle: 'Notifications', headerLargeTitle: true}}
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
}
