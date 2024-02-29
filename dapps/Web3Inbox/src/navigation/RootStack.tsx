import ConnectScreen from '@/screens/ConnectScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeTabNavigator from './HomeTabNavigator';
import {RootStackParamList} from '@/utils/TypesUtil';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Connect" component={ConnectScreen} />
      <Stack.Screen name="Home" component={HomeTabNavigator} />
    </Stack.Navigator>
  );
}
