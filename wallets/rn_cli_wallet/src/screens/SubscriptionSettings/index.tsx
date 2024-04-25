import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import {useTheme} from '@/hooks/useTheme';
import {SubscriptionsStackScreenProps} from '@/utils/TypesUtil';
import styles from './styles';

type BooleanMap = {[key: string]: boolean};
type Props = SubscriptionsStackScreenProps<'SubscriptionSettings'>;

export default function SubscriptionSettings({route}: Props) {
  const {bottom} = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topic = route.params?.topic;
  const {navigate} = useNavigation();

  const Theme = useTheme();
  const {subscriptions, notifyClient} = useNotifyClientContext();
  const [unsubscribing, setUnsubscribing] = useState(false);

  const subscription = subscriptions.find(s => s.topic === topic);
  const scopes = subscription?.scope || {};

  let scopesBooleanMap: BooleanMap = {};
  Object.keys(scopes).map((key: string) => {
    scopesBooleanMap[key] = scopes[key].enabled;
  });
  const notificationTypes = Object.keys(subscription?.scope || {}).map(
    key => scopes[key],
  );

  const {control, watch} = useForm({
    defaultValues: scopesBooleanMap,
  });

  async function handleSaveNotificationSettings() {
    const newScopes = watch();
    const enabledScopes = Object.keys(newScopes).filter(
      key => newScopes[key] === true,
    );

    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    await notifyClient.update({
      topic,
      scope: enabledScopes,
    });
  }

  async function handleUnsubscribe() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }
    setUnsubscribing(true);

    await notifyClient
      .deleteSubscription({topic})
      .then(() => {
        setUnsubscribing(false);
        navigate('Home', {
          screen: 'SubscriptionsStack',
          params: {screen: 'SubscriptionsScreen'},
        });
      })
      .catch(e => {
        Alert.alert('Failed to unsubscribe', e);
        setUnsubscribing(false);
      });
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={notificationTypes}
      renderItem={({item, index}) => (
        <View
          key={item.id}
          style={[
            styles.scopeContainer,
            {borderColor: Theme['gray-glass-010']},
            index === notificationTypes.length - 1
              ? styles.scopeContainerNoBorder
              : null,
          ]}>
          <View style={styles.scopeContentContainer}>
            <Text style={[styles.scopeTitle, {color: Theme['fg-100']}]}>
              {item.name}
            </Text>
            <Text style={[styles.scopeDescription, {color: Theme['fg-200']}]}>
              {item.description}
            </Text>
          </View>
          <View>
            <Controller
              name={item.id}
              control={control}
              render={({field: {onChange, value}}) => (
                <Switch
                  value={value}
                  onValueChange={e => {
                    onChange(e);
                    handleSaveNotificationSettings();
                  }}
                />
              )}
            />
          </View>
        </View>
      )}
      ListFooterComponent={
        <Pressable
          onPress={handleUnsubscribe}
          style={[
            {
              marginBottom: tabBarHeight + bottom + 16,
              backgroundColor: Theme['error-100'],
            },
            styles.destructiveButton,
          ]}>
          {unsubscribing ? (
            <ActivityIndicator color={Theme['fg-200']} />
          ) : (
            <Text style={styles.destructiveButtonText}>Unsubscribe</Text>
          )}
        </Pressable>
      }
    />
  );
}
