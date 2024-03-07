import ConnectScreen from '@/screens/ConnectScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeTabNavigator from './HomeTabNavigator';
import {RootStackParamList} from '@/utils/TypesUtil';
import {useInitializeNotifyClient} from '@/hooks/useInitializeNotifyClient';
import SubscriptionDetailsScreen from '@/screens/SubscriptionDetailsScreen';
import SubscriptionSettingsScreen from '@/screens/SubscriptionSettingsScreen';
import useTheme from '@/hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  useInitializeNotifyClient();
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
        contentStyle: {backgroundColor: Theme['bg-100']},
      }}>
      <Stack.Screen name="Connect" component={ConnectScreen} />
      <Stack.Screen name="Home" component={HomeTabNavigator} />
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetailsScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="SubscriptionSettings"
        component={SubscriptionSettingsScreen}
        options={{headerShown: true, headerTitle: 'Preferences'}}
      />
    </Stack.Navigator>
  );
}
