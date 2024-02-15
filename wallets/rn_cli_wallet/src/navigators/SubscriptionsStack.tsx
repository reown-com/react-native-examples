import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useNavigation} from '@react-navigation/native';
import {Pressable, Text, View} from 'react-native';
import SubscriptionSettingsScreen from '@/screens/SubscriptionSettingsScreen';
import SubscriptionsScreen from '@/screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '@/screens/SubscriptionDetailsScreen';

const Stack = createNativeStackNavigator();

import PagerView from 'react-native-pager-view';
import DiscoverScreen from '@/screens/DiscoverScreen';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@/hooks/useTheme';

const MyPager = () => {
  const viewPager = React.createRef<PagerView>();
  const headerHeight = useHeaderHeight();
  const {top} = useSafeAreaInsets();
  const Theme = useTheme();
  const [page, setPage] = React.useState(0);

  function handleSetPage(index: number) {
    viewPager.current?.setPage(index);
    setPage(index);
  }

  return (
    <View
      style={{
        paddingTop: headerHeight + top - 8,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: Theme['accent-glass-005'],
          borderBottomWidth: 0.5,
          borderColor: Theme['gray-glass-010'],
        }}>
        <Pressable
          style={{paddingHorizontal: 16, paddingVertical: 8}}
          onPress={() => {
            handleSetPage(0);
          }}>
          <Text
            style={{
              color: page === 0 ? Theme['accent-100'] : Theme['gray-glass-030'],
            }}>
            Subscriptions
          </Text>
        </Pressable>
        <Pressable
          style={{paddingHorizontal: 16, paddingVertical: 8}}
          onPress={() => {
            handleSetPage(1);
          }}>
          <Text
            style={{
              color: page === 1 ? Theme['accent-100'] : Theme['gray-glass-030'],
            }}>
            Discover
          </Text>
        </Pressable>
      </View>
      <PagerView
        ref={viewPager}
        style={{
          flex: 1,
        }}
        initialPage={0}>
        <View key="0">
          <SubscriptionsScreen />
        </View>
        <View key="1">
          <DiscoverScreen />
        </View>
      </PagerView>
    </View>
  );
};

export default function SubscriptionsStack() {
  const {navigate} = useNavigation();
  const Theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Theme['inverse-100']},
        headerStyle: {backgroundColor: Theme['inverse-100']},
        headerTitleStyle: {
          color: Theme['fg-100'],
        },
      }}>
      <Stack.Screen
        name="SubscriptionsScreen"
        options={{
          headerLargeTitle: true,
          headerTitle: 'Notifications',
        }}
        component={MyPager}
      />
      <Stack.Screen
        name="SubscriptionDetailsScreen"
        component={SubscriptionDetailsScreen}
        options={({route}) => ({
          title: route?.params?.name,
          headerTintColor: Theme['accent-100'],
          headerRight: ({}) => (
            <Pressable
              onPress={() => {
                navigate('SubscriptionSettingsScreen', {
                  topic: route?.params.topic,
                  name: route.params?.name,
                });
              }}>
              <Text
                style={{
                  fontSize: 17,
                  letterSpacing: 0.2,
                  fontWeight: 400,
                  color: Theme['accent-100'],
                }}>
                Settings
              </Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerLargeTitle: true,
          headerBackTitle: 'Back',
        }}
        name="SubscriptionSettingsScreen"
        component={SubscriptionSettingsScreen}
      />
    </Stack.Navigator>
  );
}
