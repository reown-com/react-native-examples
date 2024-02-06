import * as React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import {colors} from '../utils/theme';
import {Controller, useForm} from 'react-hook-form';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

type BooleanMap = {[key: string]: boolean};

export default function SubscriptionSettingsScreen() {
  const {params} = useRoute();
  const {bottom} = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const topic = params?.topic;
  const {navigate} = useNavigation();
  const {subscriptions, notifyClient} = useNotifyClientContext();
  const [unsubscribing, setUnsubscribing] = React.useState(false);

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

    const updated = await notifyClient.update({
      topic,
      scope: enabledScopes,
    });
    if (updated) {
      console.log('>>> updated scopes');
    } else {
      console.log('>>> failed to update scopes');
    }
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
        navigate('SubscriptionsScreen');
      })
      .catch(e => {
        Alert.alert('Failed to unsubscribe', e);
        setUnsubscribing(false);
      });
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: 'white',
      }}>
      {notificationTypes.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.scopeContainer,
            index === notificationTypes.length - 1 ? {borderWidth: 0} : null,
            index === 0 ? {paddingTop: 8} : null,
          ]}>
          <View style={styles.scopeContentContainer}>
            <Text style={styles.scopeTitle}>{item.name}</Text>
            <Text style={styles.scopeDescription}>{item.description}</Text>
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
      ))}
      <Pressable
        onPress={handleUnsubscribe}
        style={[
          {
            marginBottom: tabBarHeight + bottom + 16,
          },
          styles.destructiveButton,
        ]}>
        {unsubscribing ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.destructiveButtonText}>Unsubscribe</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  destructiveButton: {
    backgroundColor: PlatformColor('systemRed'),
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  destructiveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  scopeContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.background,
  },
  scopeContentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  buttonContainer: {
    gap: 4,
  },
  dark: {
    backgroundColor: '#141414',
  },
  scopeTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
  },
  scopeDescription: {
    width: '100%',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
    color: colors.secondary,
  },
});
