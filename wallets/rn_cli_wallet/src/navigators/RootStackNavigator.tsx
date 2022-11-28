import {createStackNavigator} from '@react-navigation/stack';

import {RootStackParamList} from '@/utils/TypesUtil';
import {HomeTabNavigator} from './HomeTabNavigator';
import SessionDetail from '@/screens/SessionDetail';
import Scan from '@/screens/Scan';
import Modal from '@/components/Modal';
import {useTheme} from '@/hooks/useTheme';
import {LogList} from '@/screens/LogList';
import {useLogs} from '@/hooks/useLogs';

const StackNavigator = createStackNavigator<RootStackParamList>();

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
            backgroundColor: Theme['bg-100'],
          },
        }}>
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
          component={SessionDetail}
          options={{
            headerShown: true,
            headerTitle: 'Session Details',
            headerBackTitleVisible: false,
            headerTintColor: Theme['fg-100'],
          }}
        />
        <StackNavigator.Screen
          name="Scan"
          component={Scan}
          options={{headerShown: false}}
        />
        <StackNavigator.Screen
          name="Logs"
          component={LogList}
          options={{
            headerShown: true,
            headerBackTitleVisible: false,
            title: 'Logs',
          }}
        />
      </StackNavigator.Navigator>
    </>
  );
}
