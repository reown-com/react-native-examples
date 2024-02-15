import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useNavigation} from '@react-navigation/native';
import {Pressable, Text} from 'react-native';
import SubscriptionSettingsScreen from '@/screens/SubscriptionSettingsScreen';
import SubscriptionsScreen from '@/screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '@/screens/SubscriptionDetailsScreen';
import useColors from '@/utils/theme';

const Stack = createNativeStackNavigator();

export default function SubscriptionsStack() {
  const {navigate} = useNavigation();
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
          headerTintColor: colors.primary,
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
                  fontSize: 17,
                  letterSpacing: 0.2,
                  fontWeight: 400,
                  color: colors.primary,
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
