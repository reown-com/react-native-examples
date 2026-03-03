import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const CURSOR_HEIGHT = 56;
const CURSOR_TIMING = { duration: 200, easing: Easing.out(Easing.ease) };

type AnimatedCursorProps = {
  isFocused: boolean;
  cursorPosition: number;
  scale: number;
  blinkEnabled?: boolean;
  containerHeight: number;
  cursorColor: string;
};

export const AnimatedCursor = ({
  isFocused,
  cursorPosition,
  scale,
  blinkEnabled = true,
  containerHeight,
  cursorColor,
}: AnimatedCursorProps) => {
  const opacity = useSharedValue(1);

  // Scale height directly instead of transform to avoid position shift
  const scaledHeight = CURSOR_HEIGHT * scale;
  const topPosition = (containerHeight - scaledHeight) / 2;

  const animatedHeight = useSharedValue(scaledHeight);
  const animatedTranslateX = useSharedValue(cursorPosition);
  const animatedTranslateY = useSharedValue(topPosition);

  useEffect(() => {
    if (isFocused) {
      if (blinkEnabled) {
        opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 0 }),
            withTiming(1, { duration: 500, easing: Easing.linear }),
            withTiming(0, { duration: 0 }),
            withTiming(0, { duration: 500, easing: Easing.linear }),
          ),
          -1,
          false,
        );
      } else {
        opacity.value = 1;
      }
    } else {
      opacity.value = withTiming(0, { duration: 100 });
    }

    return () => {
      cancelAnimation(opacity);
    };
  }, [isFocused, opacity, blinkEnabled]);

  useEffect(() => {
    animatedHeight.value = withTiming(scaledHeight, CURSOR_TIMING);
  }, [scaledHeight, animatedHeight]);

  useEffect(() => {
    animatedTranslateX.value = withTiming(cursorPosition, CURSOR_TIMING);
  }, [cursorPosition, animatedTranslateX]);

  useEffect(() => {
    animatedTranslateY.value = withTiming(topPosition, CURSOR_TIMING);
  }, [topPosition, animatedTranslateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: animatedHeight.value,
    transform: [
      { translateX: animatedTranslateX.value },
      { translateY: animatedTranslateY.value },
    ],
  }));

  if (!isFocused) return null;

  return (
    <Animated.View
      style={[styles.cursor, animatedStyle, { backgroundColor: cursorColor }]}
    />
  );
};

const styles = StyleSheet.create({
  cursor: {
    position: "absolute",
    width: 2,
    borderRadius: 1,
  },
});
