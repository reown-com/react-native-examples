import { createStackNavigator } from '@react-navigation/stack';

import { RootStackParamList } from '@/utils/TypesUtil';
import { HomeTabNavigator } from './HomeTabNavigator';
import Scan from '@/screens/Scan';
import { useTheme } from '@/hooks/useTheme';
import { LogList } from '@/screens/LogList';
import SecretPhrase from '@/screens/SecretPhrase';
import { useLogs } from '@/hooks/useLogs';
import { FontFamily } from '@/utils/ThemeUtil';
import { Header } from '@/components/Header';

const StackNavigator = createStackNavigator<RootStackParamList>();

const headerTitleStyle = {
  fontFamily: FontFamily.medium,
  fontSize: 17,
};

export function RootStackNavigator() {
  const Theme = useTheme();
  useLogs();

  return (
    <StackNavigator.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Theme['bg-primary'],
          },
          headerTitleStyle,
          cardStyle: {
            backgroundColor: Theme['bg-primary'],
          },
        }}
      >
        <StackNavigator.Screen
          options={{
            headerShown: true,
            header: () => <Header />,
          }}
          name="Home"
          component={HomeTabNavigator}
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
        <StackNavigator.Screen
          name="SecretPhrase"
          component={SecretPhrase}
          options={{
            headerShown: true,
            title: 'Secret Phrase',
            headerBackTitle: '',
            headerTintColor: Theme['text-primary'],
            headerTitleStyle: {
              fontWeight: '400',
            },
          }}
        />
    </StackNavigator.Navigator>
  );
}
