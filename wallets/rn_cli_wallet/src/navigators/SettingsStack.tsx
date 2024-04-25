import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Settings from '@/screens/Settings';
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
        name="Settings"
        options={{headerTitle: 'Settings', headerLargeTitle: true}}
        component={Settings}
      />
    </Stack.Navigator>
  );
}
