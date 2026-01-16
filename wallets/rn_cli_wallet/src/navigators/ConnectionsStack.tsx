import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/hooks/useTheme';
import Connections from '@/screens/Connections';
import { ConnectionsStackParamList } from '@/utils/TypesUtil';
import { FontFamily } from '@/utils/ThemeUtil';

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

export default function ConnectionsStack() {
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
        name="Connections"
        options={{ headerTitle: 'Connections', headerLargeTitle: true }}
        component={Connections}
      />
    </Stack.Navigator>
  );
}
