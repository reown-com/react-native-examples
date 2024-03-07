import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import useTheme from '@/hooks/useTheme';
import {Controller, useForm} from 'react-hook-form';
import {useState} from 'react';
import {useSnapshot} from 'valtio';
import {AccountController} from '@/controllers/AccountController';
import {NotifyController} from '@/controllers/NotifyController';
import {Spacing} from '@/utils/ThemeUtil';
import {Text} from '@/components/Text';
import {Divider} from '@/components/Divider';
import {RootStackScreenProps} from '@/utils/TypesUtil';

type BooleanMap = {[key: string]: boolean};

function ListFooter(onPress: () => void, loading: boolean) {
  const Theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.destructiveButton, {backgroundColor: Theme['error-100']}]}>
      {loading ? (
        <ActivityIndicator color={Theme['fg-100']} />
      ) : (
        <Text variant="small-500" color="inverse-100">
          Unsubscribe
        </Text>
      )}
    </Pressable>
  );
}

type Props = RootStackScreenProps<'SubscriptionSettings'>;

export default function SubscriptionSettingsScreen({route, navigation}: Props) {
  const {topic} = route.params;
  const {subscriptions} = useSnapshot(AccountController.state);
  const [unsubscribing, setUnsubscribing] = useState(false);

  const subscription = subscriptions.find(s => s.topic === topic);
  const scopes = subscription?.scope || {};

  let scopesBooleanMap: BooleanMap = {};
  Object.keys(scopes).map((key: string) => {
    scopesBooleanMap[key] = scopes[key].enabled;
  });

  const {control, watch} = useForm({
    defaultValues: scopesBooleanMap,
  });

  async function handleSaveNotificationSettings() {
    const notifyClient = NotifyController.getClient();
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
    const notifyClient = NotifyController.getClient();
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }
    setUnsubscribing(true);

    await notifyClient
      .deleteSubscription({topic})
      .then(() => {
        setUnsubscribing(false);
        navigation.navigate({name: 'Home', params: {screen: 'Subscriptions'}});
      })
      .catch(e => {
        Alert.alert('Failed to unsubscribe', e);
        setUnsubscribing(false);
      });
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
      data={Object.values(scopes)}
      ItemSeparatorComponent={Divider}
      renderItem={({item}) => (
        <View key={item.id} style={styles.scopeContainer}>
          <View style={styles.scopeContentContainer}>
            <Text variant="paragraph-600">{item.name} Notifications</Text>
            <Text variant="small-500" color="fg-200">
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
      ListFooterComponent={ListFooter.bind(
        null,
        handleUnsubscribe,
        unsubscribing,
      )}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: Spacing.l,
  },
  destructiveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: Spacing.l,
  },
  scopeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: Spacing.l,
  },
  scopeContentContainer: {
    flex: 1,
    rowGap: 4,
    justifyContent: 'center',
    paddingVertical: Spacing.l,
    marginRight: Spacing.s,
  },
});
