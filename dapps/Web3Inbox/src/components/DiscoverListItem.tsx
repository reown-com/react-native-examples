import {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import useTheme from '@/hooks/useTheme';
import {ProjectItem} from '@/constants/Explorer';
import {Text} from '@/components/Text';
import {Spacing} from '@/utils/ThemeUtil';

type DiscoverListItemProps = {
  item: ProjectItem;
  isSubscribed?: boolean;
  onSubscribe?: (domain: string) => Promise<void>;
  onPress?: () => void;
};

export default function DiscoverListItem({
  item,
  isSubscribed,
  onSubscribe,
  onPress,
}: DiscoverListItemProps) {
  const Theme = useTheme();
  const [subscribing, setSubscribing] = useState(false);
  const domain = new URL(item.dapp_url).host;

  async function handleSubscribeToDapp() {
    setSubscribing(true);
    await onSubscribe?.(domain);
    setSubscribing(false);
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || !isSubscribed}
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
        <Text
          color="fg-150"
          variant="small-400"
          style={styles.description}
          numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </Pressable>
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
