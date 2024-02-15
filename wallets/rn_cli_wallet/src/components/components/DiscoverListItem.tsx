import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';

import projectsData from '@/constants/projects-resposne.json';

import {useTheme} from '@/hooks/useTheme';

type ProjectItem = (typeof projectsData)[0];

type DiscoverListItemProps = {
  item: ProjectItem;
};

export default function DiscoverListItem({item}: DiscoverListItemProps) {
  const {account, subscriptions, notifyClient} = useNotifyClientContext();
  const Theme = useTheme();

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
          backgroundColor: Theme['accent-glass-005'],
          borderColor: Theme['accent-glass-020'],
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <View style={styles.imageBorder} />
          <Image source={{uri: item.image_url.md}} style={styles.image} />
        </View>
        <Pressable
          onPress={handleSubscribeToDapp}
          style={[
            isSubscribed
              ? {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: Theme['gray-glass-010'],
                }
              : {backgroundColor: Theme['accent-100']},
            styles.button,
          ]}>
          {subscribing ? (
            <ActivityIndicator color={Theme['bg-100']} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                isSubscribed
                  ? {color: Theme['fg-200']}
                  : {color: Theme['bg-100']},
              ]}>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          )}
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, {color: Theme['accent-100']}]}>
          {item.name}
        </Text>
        <Text style={[styles.domain, {color: Theme['fg-250']}]}>{domain}</Text>
        <Text style={[styles.subtitle, {color: Theme['fg-200']}]}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  title: {
    width: '100%',
    fontSize: 18,
    fontWeight: '500',
  },
  domain: {
    width: '100%',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
  },
  subtitle: {
    width: '100%',
    fontSize: 14,
    fontWeight: '400',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  button: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 32,
    position: 'relative',
  },
  imageBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 1.25,
    borderColor: 'rgba(150,150,150,1)',
    zIndex: 999,
    opacity: 0.15,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
});
