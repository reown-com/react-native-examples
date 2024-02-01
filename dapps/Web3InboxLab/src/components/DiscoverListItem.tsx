import * as React from 'react';
import {Alert, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import useNotifyClient from '../hooks/useNotifyClient';

import projectsData from '../constants/projects-resposne.json';
import {colors} from '../utils/theme';

type ProjectItem = (typeof projectsData)[0];

type DiscoverListItemProps = {
  item: ProjectItem;
};

export default function DiscoverListItem({item}: DiscoverListItemProps) {
  const {account, subscriptions, notifyClient} = useNotifyClient();

  const isSubscribed = subscriptions.some(s =>
    item.dapp_url.includes(s.metadata.appDomain),
  );

  const [subscribing, setSubscribing] = React.useState(false);

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

    const appDomain = 'w3m-dapp.vercel.app';

    await notifyClient.subscribe({
      account,
      appDomain,
    });

    setSubscribing(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            position: 'relative',
          }}>
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 32,
              borderWidth: 1.25,
              borderColor: 'rgba(150,150,150,1)',
              zIndex: 999,
              opacity: 0.15,
            }}
          />
          <Image
            source={{uri: item.image_url.md}}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 32,
            }}
          />
        </View>
        <Pressable
          onPress={handleSubscribeToDapp}
          style={[
            isSubscribed
              ? {backgroundColor: colors.backgroundActive}
              : {
                  backgroundColor: colors.primary,
                },
            styles.button,
          ]}>
          <Text
            style={[
              isSubscribed
                ? {color: colors.primary}
                : {
                    color: 'white',
                  },
              styles.buttonText,
            ]}>
            {isSubscribed
              ? 'Subscribed'
              : subscribing
              ? 'Subscribing..'
              : 'Subscribe'}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.domain}>{item.dapp_url}</Text>
      <Text style={styles.subtitle}>{item.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    gap: 8,
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.backgroundActive,
  },
  title: {
    width: '100%',
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
  },
  domain: {
    width: '100%',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
    color: colors.secondary,
  },
  subtitle: {
    width: '100%',
    fontSize: 14,
    fontWeight: '400',
    color: colors.secondary,
  },
  imageContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '400',
  },
});
