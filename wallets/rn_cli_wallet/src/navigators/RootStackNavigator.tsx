import {createStackNavigator} from '@react-navigation/stack';

import {RootStackParamList} from '@/utils/TypesUtil';
import {HomeTabNavigator} from './HomeTabNavigator';
import SessionDetail from '@/screens/SessionDetail';
import Scan from '@/screens/Scan';
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
      </StackNavigator.Navigator>
    </>
  );
}
