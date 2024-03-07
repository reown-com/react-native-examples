import {
  Animated,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import useTheme from '@/hooks/useTheme';
import {DateUtil} from '@/utils/DateUtil';
import {Spacing} from '@/utils/ThemeUtil';
import {Text} from '@/components/Text';
import {useRef} from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NotificationItemProps = {
  title: string;
  description: string;
  sentAt: number;
  url?: string | null;
  imageUrl?: string;
};

// TODO: add show more button
export default function NotificationItem({
  title,
  description,
  sentAt,
  url,
  imageUrl,
}: NotificationItemProps) {
  const Theme = useTheme();
  const colorAnimation = useRef(new Animated.Value(0));

  const onPressIn = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: false,
      duration: 200,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: false,
      duration: 200,
    }).start();
  };

  const backgroundColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme['bg-100'], Theme['accent-010']],
  });

  const borderColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme['bg-100'], Theme['accent-100']],
  });

  const onPress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <AnimatedPressable
      disabled={!url}
      style={[styles.container, {backgroundColor, borderColor}]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}>
      <Image source={{uri: imageUrl}} style={styles.image} />
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Text variant="paragraph-500" color="fg-100">
            {title}
          </Text>
          {sentAt ? (
            <Text color="fg-250" variant="tiny-500">
              {DateUtil.getRelativeDateFromNow(sentAt)}
            </Text>
          ) : null}
        </View>
        <Text numberOfLines={3} variant="small-400">
          {description}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
  },
  textContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    height: 48,
    width: 48,
    borderRadius: 10,
    marginRight: Spacing.xs,
  },
});
