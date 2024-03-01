import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import useNotifyClientContext from '../hooks/useNotifyClientContext';

import useColors from '@/hooks/useColors';
import {ProjectItem} from '@/constants/Explorer';
import {Text} from '@/components/Text';
import {Spacing} from '@/utils/ThemeUtil';

type DiscoverListItemProps = {
  item: ProjectItem;
};

export default function DiscoverListItem({item}: DiscoverListItemProps) {
  const {account, subscriptions, notifyClient} = useNotifyClientContext();
  const Theme = useColors();

  const [subscribing, setSubscribing] = React.useState(false);
  const domain = new URL(item.dapp_url).host;

  const isSubscribed = subscriptions.some(s =>
    item.dapp_url.includes(s.metadata.appDomain),
  );

  async function handleSubscribeToDapp() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }
    setSubscribing(true);

    await notifyClient
      .subscribe({
        account,
        appDomain: domain,
      })
      .then(res => {
        if (res) {
          setSubscribing(false);
        }
      })
      .catch(e => {
        setSubscribing(false);
        Alert.alert('Error subscribing to dapp', e.message);
      });
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme['bg-100'],
          borderColor: Theme['gray-glass-010'],
        },
      ]}>
      <View style={styles.header}>
        <View>
          <View style={styles.imageBorder} />
          <Image source={{uri: item.image_url.md}} style={styles.image} />
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSubscribeToDapp}
          style={[
            {backgroundColor: Theme['fg-100'], borderColor: Theme['fg-100']},
            styles.button,
            isSubscribed && styles.buttonSubscribed,
          ]}>
          {subscribing ? (
            <ActivityIndicator color={Theme['bg-100']} />
          ) : (
            <Text
              variant="small-600"
              color={isSubscribed ? 'fg-100' : 'inverse-100'}>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View>
        <Text variant="paragraph-600" color="fg-100">
          {item.name}
        </Text>
        <Text color="fg-200" variant="tiny-500" style={styles.subtitle}>
          {domain}
        </Text>
        <Text color="fg-150" variant="small-400" style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    rowGap: Spacing.s,
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    marginTop: Spacing['4xs'],
  },
  description: {
    marginTop: Spacing.s,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSubscribed: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  imageBorder: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 32,
    borderWidth: 1.25,
    borderColor: 'rgba(150,150,150,1)',
    zIndex: 999,
    opacity: 0.15,
  },
  image: {
    borderRadius: 32,
    width: 48,
    height: 48,
  },
});
