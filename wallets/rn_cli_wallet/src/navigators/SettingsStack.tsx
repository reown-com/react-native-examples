import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import Settings from '@/screens/Settings';
import { useTheme } from '@/hooks/useTheme';
import { SettingsStackParamList } from '@/utils/TypesUtil';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const fontFamily = Platform.select({
  ios: 'KHTeka-Medium',
  android: 'KHTeka-Medium',
});

export default function SettingsStack() {
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: Theme['bg-primary'] },
        headerStyle: { backgroundColor: Theme['bg-primary'] },
        headerTitleStyle: {
          color: Theme['text-primary'],
          fontFamily,
        },
        headerLargeTitleStyle: {
          color: Theme['text-primary'],
          fontFamily,
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
