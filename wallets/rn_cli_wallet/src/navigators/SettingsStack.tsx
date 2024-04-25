import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SettingsScreen from '@/screens/SettingsView';
import {useTheme} from '@/hooks/useTheme';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Theme['bg-100']},
        headerStyle: {backgroundColor: Theme['bg-100']},
        headerTitleStyle: {
          color: Theme['fg-100'],
        },
      }}>
      <Stack.Screen
        name="SettingsScreen"
        options={{headerTitle: 'Settings', headerLargeTitle: true}}
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}
