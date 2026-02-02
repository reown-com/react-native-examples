import { useEffect } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Button } from '@/components/Button';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  selectedOption: T;
  onSelect: (option: T) => void;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export function SegmentedControl<T extends string>({
  options,
  selectedOption,
  onSelect,
}: SegmentedControlProps<T>) {
  const Theme = useTheme();

  const selectedIndex = options.indexOf(selectedOption);
  const segmentWidth = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Update translateX when selection changes
  useEffect(() => {
    if (segmentWidth.value > 0) {
      translateX.value = withSpring(
        selectedIndex * segmentWidth.value,
        SPRING_CONFIG,
      );
    }
  }, [selectedIndex, segmentWidth, translateX]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    containerWidth.value = width;
    const padding = Spacing['05'] * 2;
    segmentWidth.value = (width - padding) / options.length;
    translateX.value = selectedIndex * segmentWidth.value;
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: segmentWidth.value,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
      onLayout={handleContainerLayout}
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: Theme['foreground-accent-primary-40'] },
          indicatorStyle,
        ]}
      />
      {options.map(option => {
        const isActive = option === selectedOption;
        return (
          <Button
            key={option}
            onPress={() => onSelect(option)}
            style={styles.segment}
          >
            <AnimatedText
              text={option}
              isActive={isActive}
              activeColor={Theme['text-primary']}
              inactiveColor={Theme['text-secondary']}
            />
          </Button>
        );
      })}
    </View>
  );
}

interface AnimatedTextProps {
  text: string;
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

function AnimatedText({
  text,
  isActive,
  activeColor,
  inactiveColor,
}: AnimatedTextProps) {
  const progress = useDerivedValue(() => {
    return withSpring(isActive ? 1 : 0, SPRING_CONFIG);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor],
    );
    return { color };
  });

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>{text}</Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius[3],
    padding: Spacing['05'],
    width: '100%',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: Spacing['05'],
    left: Spacing['05'],
    bottom: Spacing['05'],
    borderRadius: BorderRadius[2],
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius[2],
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
