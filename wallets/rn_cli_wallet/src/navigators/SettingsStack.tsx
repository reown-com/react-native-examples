import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Settings from '@/screens/Settings';
import { useTheme } from '@/hooks/useTheme';
import { SettingsStackParamList } from '@/utils/TypesUtil';
import { FontFamily } from '@/utils/ThemeUtil';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: Theme['bg-primary'] },
        headerStyle: { backgroundColor: Theme['bg-primary'] },
        headerTitleStyle: {
          color: Theme['text-primary'],
          fontFamily: FontFamily.medium,
        },
        headerLargeTitleStyle: {
          color: Theme['text-primary'],
          fontFamily: FontFamily.medium,
        },
        headerLargeTitleShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Settings"
        options={{ headerTitle: 'Settings', headerLargeTitle: true }}
        component={Settings}
      />
    </Stack.Navigator>
  );
}
