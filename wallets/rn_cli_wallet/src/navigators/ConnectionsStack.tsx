import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useTheme} from '@/hooks/useTheme';
import Connections from '@/screens/Connections';
import {ConnectionsStackParamList} from '@/utils/TypesUtil';

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

export default function ConnectionsStack() {
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
        name="Connections"
        options={{headerTitle: 'Connections', headerLargeTitle: true}}
        component={Connections}
      />
    </Stack.Navigator>
  );
}
