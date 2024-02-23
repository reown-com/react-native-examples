import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../utils/TypesUtil';
import {HomeTabNavigator} from './HomeTabNavigator';
import OnboardingView from '../screens/OnboardingView';
import SessionDetailView from '../screens/SessionDetailView';
import {ScanView} from '../screens/ScanView';
import Modal from '@/components/Modal';
import {useTheme} from '@/hooks/useTheme';

const StackNavigator = createStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  const Theme = useTheme();

  return (
    <>
      <Modal />
      <StackNavigator.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Theme['bg-100'],
          },
        }}>
        <StackNavigator.Screen name="Onboarding" component={OnboardingView} />
        <StackNavigator.Screen
          options={{
            headerStyle: {
              backgroundColor: Theme['bg-100'],
            },
          }}
          name="Home"
          component={HomeTabNavigator}
        />
        <StackNavigator.Screen
          name="SessionDetail"
          component={SessionDetailView}
          options={{
            headerShown: true,
            headerTitle: 'Session Details',
            headerBackTitleVisible: false,
          }}
        />
        <StackNavigator.Screen
          name="Scan"
          component={ScanView}
          options={{headerShown: false}}
        />
      </StackNavigator.Navigator>
    </>
  );
}
