import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useNavigation} from '@react-navigation/native';
import {PlatformColor, Pressable, Text} from 'react-native';
import SubscriptionSettingsScreen from '../screens/SubscriptionSettingsScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';

const Stack = createNativeStackNavigator();

export default function SubscriptionsStack() {
  const {navigate} = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: 'white'},
      }}>
      <Stack.Screen
        name="SubscriptionsScreen"
        options={{
          headerTitle: 'Subscriptions',
          headerLargeTitle: true,
        }}
        component={SubscriptionsScreen}
      />
      <Stack.Screen
        name="SubscriptionDetailsScreen"
        component={SubscriptionDetailsScreen}
        options={({route}) => ({
          title: route?.params?.name,
          headerRight: ({}) => (
            <Pressable
              onPress={() => {
                navigate('SubscriptionSettingsScreen', {
                  topic: route?.params.topic,
                  name: route.params?.name,
                });
              }}>
              <Text
                style={{
                  fontSize: 18,
                  letterSpacing: 0.2,
                  fontWeight: 400,
                  color: 'blue',
                }}>
                Settings
              </Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerLargeTitle: true,
          headerBackTitle: 'Back',
        }}
        name="SubscriptionSettingsScreen"
        component={SubscriptionSettingsScreen}
      />
    </Stack.Navigator>
  );
}
