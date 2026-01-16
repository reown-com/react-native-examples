import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import { RootStackParamList } from '@/utils/TypesUtil';
import { HomeTabNavigator } from './HomeTabNavigator';
import SessionDetail from '@/screens/SessionDetail';
import Scan from '@/screens/Scan';
import Modal from '@/components/Modal';
import { useTheme } from '@/hooks/useTheme';
import { LogList } from '@/screens/LogList';
import { useLogs } from '@/hooks/useLogs';

const StackNavigator = createStackNavigator<RootStackParamList>();

const headerTitleStyle = {
  fontFamily: Platform.select({
    ios: 'KHTeka-Medium',
    android: 'KHTeka-Medium',
  }),
  fontSize: 17,
};

export function RootStackNavigator() {
  const Theme = useTheme();
  useLogs();

  return (
    <>
      <Modal />
      <StackNavigator.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Theme['bg-primary'],
          },
          headerTitleStyle,
        }}
      >
        <StackNavigator.Screen
          options={{
            headerStyle: {
              backgroundColor: Theme['bg-primary'],
            },
          }}
          name="Home"
          component={HomeTabNavigator}
        />
        <StackNavigator.Screen
          name="SessionDetail"
          component={SessionDetail}
          options={{
            headerShown: true,
            headerTitle: 'Session Details',
            headerBackTitle: '',
            headerTintColor: Theme['text-primary'],
            headerTitleStyle: {
              fontWeight: '400',
            },
          }}
        />
        <StackNavigator.Screen
          name="Scan"
          component={Scan}
          options={{ headerShown: false }}
        />
        <StackNavigator.Screen
          name="Logs"
          component={LogList}
          options={{
            headerShown: true,
            title: 'Logs',
            headerBackTitle: '',
            headerTintColor: Theme['text-primary'],
            headerTitleStyle: {
              fontWeight: '400',
            },
          }}
        />
      </StackNavigator.Navigator>
    </>
  );
}
