import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {Pressable, Text, View} from 'react-native';
import SubscriptionSettingsScreen from '@/screens/SubscriptionSettingsScreen';
import SubscriptionDetailsScreen from '@/screens/SubscriptionDetailsScreen';

import {useTheme} from '@/hooks/useTheme';
import {SubscriptionsStackParamList} from '@/utils/TypesUtil';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SubscriptionsScreen from '@/screens/SubscriptionsScreen';

const Stack = createNativeStackNavigator<SubscriptionsStackParamList>();

export default function SubscriptionsStack() {
  const navigation = useNavigation();
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
        name="SubscriptionsScreen"
        options={{
          headerLargeTitle: true,
          headerTitle: 'Notifications',
        }}
        component={SubscriptionsScreen}
      />
      <Stack.Screen
        name="SubscriptionDetailsScreen"
        component={SubscriptionDetailsScreen}
        options={({route}) => ({
          title: route?.params?.name,
          headerTintColor: Theme['accent-100'],
          headerRight: ({}) => (
            <Pressable
              onPress={() => {
                navigation.navigate('SubscriptionSettingsScreen', {
                  topic: route?.params.topic,
                  name: route.params?.name,
                });
              }}>
              <Text
                style={{
                  fontSize: 17,
                  letterSpacing: 0.2,
                  color: Theme['accent-100'],
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
