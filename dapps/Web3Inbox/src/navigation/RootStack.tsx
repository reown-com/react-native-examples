import ConnectScreen from '@/screens/ConnectScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeTabNavigator from './HomeTabNavigator';
import {RootStackParamList} from '@/utils/TypesUtil';
import {useInitializeNotifyClient} from '@/hooks/useInitializeNotifyClient';
import SubscriptionDetailsScreen from '@/screens/SubscriptionDetailsScreen';
import SubscriptionSettingsScreen from '@/screens/SubscriptionSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  useInitializeNotifyClient();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Connect" component={ConnectScreen} />
      <Stack.Screen name="Home" component={HomeTabNavigator} />
      <Stack.Screen
        name="SubscriptionDetailsScreen"
        component={SubscriptionDetailsScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="SubscriptionSettingsScreen"
        component={SubscriptionSettingsScreen}
        options={{headerShown: true, headerTitle: 'Settings'}}
      />
    </Stack.Navigator>
  );
}
