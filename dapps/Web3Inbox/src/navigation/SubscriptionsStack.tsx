import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useNavigation} from '@react-navigation/native';
import {Pressable, Text} from 'react-native';
import SubscriptionSettingsScreen from '../screens/SubscriptionSettingsScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import useColors from '@/hooks/useColors';
import {W3mAccountButton} from '@web3modal/wagmi-react-native';

const Stack = createNativeStackNavigator();

function AccountButton() {
  return <W3mAccountButton />;
}

export default function SubscriptionsStack() {
  const {navigate} = useNavigation();
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
        name="SubscriptionsScreen"
        options={{
          headerTitle: 'Subscriptions',
          headerLargeTitle: true,
          headerRight: AccountButton,
        }}
        component={SubscriptionsScreen}
      />
      <Stack.Screen
        name="SubscriptionDetailsScreen"
        component={SubscriptionDetailsScreen}
        options={({route}) => ({
          title: route?.params?.name,
          headerTintColor: Theme['inverse-000'],
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
                  color: Theme['inverse-000'],
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
