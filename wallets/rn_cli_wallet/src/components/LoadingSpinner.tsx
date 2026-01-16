import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ThemeKeys } from '@/utils/TypesUtil';

// Size presets
const sizePresets = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

type SizePreset = keyof typeof sizePresets;

export interface LoadingSpinnerProps {
  /** Size preset */
  size?: SizePreset;
  /** Theme color key for the spinner */
  color?: ThemeKeys;
}

export function LoadingSpinner({
  size = 'md',
  color = 'text-secondary',
}: LoadingSpinnerProps) {
  const Theme = useTheme();
  const rotation = useSharedValue(0);

  const spinnerSize = sizePresets[size];
  const borderWidth = Math.max(2, spinnerSize / 10);
  const spinnerColor = Theme[color];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={[styles.container, { width: spinnerSize, height: spinnerSize }]}
    >
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderWidth,
            borderColor: `${spinnerColor}30`, // 30% opacity for background
            borderTopColor: spinnerColor,
            borderRadius: spinnerSize / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
});
