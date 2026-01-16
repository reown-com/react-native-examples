import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import Connections from '@/screens/Connections';
import { ConnectionsStackParamList } from '@/utils/TypesUtil';

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

const fontFamily = Platform.select({
  ios: 'KHTeka-Medium',
  android: 'KHTeka-Medium',
});

export default function ConnectionsStack() {
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
        name="Connections"
        options={{ headerTitle: 'Connections', headerLargeTitle: true }}
        component={Connections}
      />
    </Stack.Navigator>
  );
}
