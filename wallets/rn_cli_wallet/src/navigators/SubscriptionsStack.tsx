import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SubscriptionSettings from '@/screens/SubscriptionSettings';
import SubscriptionDetail from '@/screens/SubscriptionDetail';
import {useTheme} from '@/hooks/useTheme';
import {SubscriptionsStackParamList} from '@/utils/TypesUtil';
import SubscriptionsScreen from '@/screens/Subscriptions';
import SubscriptionDetailsSettingsButton from '@/components/SubscriptionDetailsSettingsButton';

const Stack = createNativeStackNavigator<SubscriptionsStackParamList>();

function SubscriptionSettingsButton({
  topic,
  name,
}: {
  topic: string;
  name: string;
}) {
  return <SubscriptionDetailsSettingsButton topic={topic} name={name} />;
}

export default function SubscriptionsStack() {
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
        name="SubscriptionsScreen"
        options={{
          headerLargeTitle: true,
          headerTitle: 'Inbox',
        }}
        component={SubscriptionsScreen}
      />
      <Stack.Screen
        name="SubscriptionDetail"
        component={SubscriptionDetail}
        options={({route}) => ({
          title: route?.params?.name,
          headerTintColor: Theme['fg-100'],
          headerRight: SubscriptionSettingsButton.bind(null, {
            topic: route.params.topic,
            name: route.params.name,
          }),
        })}
      />
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerLargeTitle: true,
          headerTintColor: Theme['fg-100'],
          headerBackTitle: 'Back',
        }}
        name="SubscriptionSettings"
        component={SubscriptionSettings}
      />
    </Stack.Navigator>
  );
}
