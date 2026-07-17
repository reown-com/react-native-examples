import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function WalletConnectLoading({ size = 120 }: { size?: number }) {
  const Theme = useTheme();
  const gap = 2; // 2px gap between squares
  const squareSize = (size - gap) / 2; // Each square takes half minus gap

  // Corner radius for each square
  const cornerTL = useSharedValue(squareSize * 0.12);
  const cornerTR = useSharedValue(squareSize * 0.12);
  const cornerBL = useSharedValue(squareSize * 0.1);
  const cornerBR = useSharedValue(squareSize * 0.12);

  // Opacity for each square
  const opacityTL = useSharedValue(0);
  const opacityTR = useSharedValue(0);
  const opacityBL = useSharedValue(0);
  const opacityBR = useSharedValue(0);

  useEffect(() => {
    const easeInOut = Easing.inOut(Easing.ease);
    const fadeTime = 80; // Quick fade in/out

    // Bottom-left (gray pill) - appears at 30ms, disappears at 3580ms
    opacityBL.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 30 }), // Wait 30ms
        withTiming(1, { duration: fadeTime }), // Fade in by 110ms
        withTiming(1, { duration: 3470 }), // Stay visible until 3580ms
        withTiming(0, { duration: fadeTime }), // Fade out by 3660ms
        withTiming(0, { duration: 340 }), // Stay hidden until 4000ms
      ),
      -1,
      false,
    );

    // Bottom-left (gray pill) - Border radius animation
    // Timeline: 30ms (appear) -> 3580ms (disappear)
    cornerBL.value = withRepeat(
      withSequence(
        withTiming(squareSize * 0.1, { duration: 30 }), // 0-30ms: Initial state, waiting to appear
        withTiming(squareSize * 0.15, { duration: 50, easing: easeInOut }), // 30-80ms: Quick subtle rounding as it appears
        withTiming(squareSize * 0.15, { duration: 1150 }), // 80-1230ms: Hold slightly rounded state
        withTiming(squareSize * 0.25, { duration: 1000, easing: easeInOut }), // 1230-2230ms: Animate to full capsule/pill shape
        withTiming(squareSize * 0.25, { duration: 500 }), // 2230-2730ms: Hold pill shape
        withTiming(squareSize * 0.1, { duration: 1000, easing: easeInOut }), // 2730-3730ms: Return to less rounded
        withTiming(squareSize * 0.1, { duration: 270 }), // 3730-4000ms: Stay at initial state while hidden
      ),
      -1,
      false,
    );

    // Bottom-right (blue) - appears at 120ms, disappears at 3660ms
    opacityBR.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 120 }), // Wait 120ms
        withTiming(1, { duration: fadeTime }), // Fade in by 200ms
        withTiming(1, { duration: 3460 }), // Stay visible until 3660ms
        withTiming(0, { duration: fadeTime }), // Fade out by 3740ms
        withTiming(0, { duration: 260 }), // Stay hidden until 4000ms
      ),
      -1,
      false,
    );

    // Bottom-right (blue) - Border radius animation
    // Timeline: 120ms (appear) -> 3660ms (disappear)
    cornerBR.value = withRepeat(
      withSequence(
        withTiming(squareSize * 0.12, { duration: 120 }), // 0-120ms: Initial state, waiting to appear
        withTiming(squareSize * 0.2, { duration: 850, easing: easeInOut }), // 120-970ms: First rounding phase
        withTiming(squareSize * 0.2, { duration: 600 }), // 970-1570ms: Hold moderately rounded state
        withTiming(squareSize * 0.48, { duration: 1100, easing: easeInOut }), // 1570-2670ms: Dramatic rounding to nearly perfect circle
        withTiming(squareSize * 0.12, { duration: 900, easing: easeInOut }), // 2670-3570ms: Return to less rounded
        withTiming(squareSize * 0.12, { duration: 430 }), // 3570-4000ms: Stay at initial state while hidden
      ),
      -1,
      false,
    );

    // Top-right (dark gray) - appears at 200ms, disappears at 3740ms
    opacityTR.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 200 }), // Wait 200ms
        withTiming(1, { duration: fadeTime }), // Fade in by 280ms
        withTiming(1, { duration: 3460 }), // Stay visible until 3740ms
        withTiming(0, { duration: fadeTime }), // Fade out by 3820ms
        withTiming(0, { duration: 180 }), // Stay hidden until 4000ms
      ),
      -1,
      false,
    );

    // Top-right (dark gray) - Border radius animation
    // Timeline: 200ms (appear) -> 3740ms (disappear)
    cornerTR.value = withRepeat(
      withSequence(
        withTiming(squareSize * 0.12, { duration: 200 }), // 0-200ms: Initial state, waiting to appear
        withTiming(squareSize * 0.45, { duration: 800, easing: easeInOut }), // 200-1000ms: First rounding phase
        withTiming(squareSize * 0.45, { duration: 500 }), // 1000-1500ms: Hold highly rounded state
        withTiming(squareSize * 0.2, { duration: 900, easing: easeInOut }), // 1500-2400ms: Reduce rounding to moderate
        withTiming(squareSize * 0.2, { duration: 600 }), // 2400-3000ms: Hold moderately rounded state
        withTiming(squareSize * 0.12, { duration: 700, easing: easeInOut }), // 3000-3700ms: Return to less rounded
        withTiming(squareSize * 0.12, { duration: 300 }), // 3700-4000ms: Stay at initial state while hidden
      ),
      -1,
      false,
    );

    // Top-left (light gray) - appears at 250ms, disappears at 3780ms
    opacityTL.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 250 }), // Wait 250ms
        withTiming(1, { duration: fadeTime }), // Fade in by 330ms
        withTiming(1, { duration: 3450 }), // Stay visible until 3780ms
        withTiming(0, { duration: fadeTime }), // Fade out by 3860ms
        withTiming(0, { duration: 140 }), // Stay hidden until 4000ms
      ),
      -1,
      false,
    );

    // Top-left (light gray) - Border radius animation
    // Timeline: 250ms (appear) -> 3780ms (disappear)
    cornerTL.value = withRepeat(
      withSequence(
        withTiming(squareSize * 0.12, { duration: 250 }), // 0-250ms: Initial state, waiting to appear
        withTiming(squareSize * 0.3, { duration: 750, easing: easeInOut }), // 250-1000ms: First rounding phase
        withTiming(squareSize * 0.3, { duration: 600 }), // 1000-1600ms: Hold moderately rounded state
        withTiming(squareSize * 0.2, { duration: 1000, easing: easeInOut }), // 1600-2600ms: Reduce rounding slightly
        withTiming(squareSize * 0.2, { duration: 1000 }), // 2600-3600ms: Hold slightly less rounded state
        withTiming(squareSize * 0.12, { duration: 400, easing: easeInOut }), // 3600-4000ms: Return to less rounded
      ),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squareSize]);

  // Animated styles for each square
  const animatedStyleTL = useAnimatedStyle(() => ({
    opacity: opacityTL.value,
    borderRadius: cornerTL.value,
  }));

  const animatedStyleTR = useAnimatedStyle(() => ({
    opacity: opacityTR.value,
    borderRadius: cornerTR.value,
  }));

  const animatedStyleBL = useAnimatedStyle(() => ({
    opacity: opacityBL.value,
    borderRadius: cornerBL.value,
  }));

  const animatedStyleBR = useAnimatedStyle(() => ({
    opacity: opacityBR.value,
    borderRadius: cornerBR.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top left - Light gray */}
      <Animated.View
        style={[
          styles.square,
          styles.squareTopLeft,
          { width: squareSize, height: squareSize },
          animatedStyleTL,
        ]}
      />

      {/* Top right - Dark gray */}
      <Animated.View
        style={[
          styles.square,
          styles.squareTopRight,
          { width: squareSize, height: squareSize, left: squareSize + gap },
          animatedStyleTR,
        ]}
      />

      {/* Bottom left - Gray - Half height pill at bottom */}
      <Animated.View
        style={[
          styles.square,
          styles.squareBottomLeft,
          {
            width: squareSize,
            height: squareSize / 2,
            top: squareSize + gap + squareSize / 2,
          },
          animatedStyleBL,
        ]}
      />

      {/* Bottom right - Accent Primary */}
      <Animated.View
        style={[
          styles.square,
          styles.squareBottomRight,
          {
            width: squareSize,
            height: squareSize,
            backgroundColor: Theme['bg-accent-primary'],
            top: squareSize + gap,
            left: squareSize + gap,
          },
          animatedStyleBR,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  square: {
    // Base square styles (size and position defined inline)
  },
  squareTopLeft: {
    backgroundColor: '#E8E8E8',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  squareTopRight: {
    backgroundColor: '#363636',
    position: 'absolute',
    top: 0,
  },
  squareBottomLeft: {
    backgroundColor: '#6C6C6C',
    position: 'absolute',
    left: 0,
  },
  squareBottomRight: {
    position: 'absolute',
  },
});
