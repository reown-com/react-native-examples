import {useRef} from 'react';
import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/components/Text';
import useTheme from '@/hooks/useTheme';
import {Spacing} from '@/utils/ThemeUtil';

interface ISubscriptionItem {
  title: string;
  description: string;
  imageURL: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SubscriptionItem({
  title,
  description,
  imageURL,
  onPress,
}: ISubscriptionItem) {
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

  return (
    <AnimatedPressable
      style={[styles.container, {backgroundColor, borderColor}]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}>
      <Image source={{uri: imageURL}} style={styles.image} />
      <View style={styles.contentContainer}>
        <Text variant="small-500">{title}</Text>
        <Text variant="small-500" color="fg-150">
          {description}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: Spacing.s,
  },
  contentContainer: {
    justifyContent: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 32,
  },
});
