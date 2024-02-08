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
import useColors from '../utils/theme';
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
  const colors = useColors();
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
        paddingHorizontal: 16,
      }}>
      <View
        style={{
          width: '100%',
          marginTop: 16,
          borderRadius: 8,
          backgroundColor: colors.background,
        }}>
        {notificationTypes.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.scopeContainer,
              index === notificationTypes.length - 1 ? {borderWidth: 0} : null,
              {borderColor: colors.backgroundSecondary},
            ]}>
            <View style={styles.scopeContentContainer}>
              <Text style={[styles.scopeTitle, {color: colors.primary}]}>
                {item.name}
              </Text>
              <Text
                style={[styles.scopeDescription, {color: colors.secondary}]}>
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
        ))}
      </View>
      <Pressable
        onPress={handleUnsubscribe}
        style={[
          {
            marginBottom: tabBarHeight + bottom + 16,
          },
          styles.destructiveButton,
        ]}>
        {unsubscribing ? (
          <ActivityIndicator color={colors.secondary} />
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
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 0.5,
    paddingHorizontal: 16,
  },
  scopeContentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 16,
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
  },
  scopeDescription: {
    width: '100%',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
  },
});
