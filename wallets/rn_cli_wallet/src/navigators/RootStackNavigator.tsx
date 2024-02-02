import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../utils/TypesUtil';
import {MainTabNavigator} from './MainTabNavigator';
import OnboardingView from '../screens/OnboardingView';
import SessionDetailView from '../screens/SessionDetailView';

const StackNavigator = createStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <StackNavigator.Screen name="Onboarding" component={OnboardingView} />
      <StackNavigator.Screen name="Home" component={MainTabNavigator} />
      <StackNavigator.Screen
        name="SessionDetail"
        component={SessionDetailView}
        options={{headerShown: true, headerTitle: 'Session Details'}}
      />
    </StackNavigator.Navigator>
  );
}
