import { useTheme } from "@/hooks/use-theme-color";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const CURSOR_HEIGHT = 56;

type AnimatedCursorProps = {
  isFocused: boolean;
  cursorPosition: number;
  scale: number;
  blinkEnabled?: boolean;
  containerHeight: number;
};

export const AnimatedCursor = ({
  isFocused,
  cursorPosition,
  scale,
  blinkEnabled = true,
  containerHeight,
}: AnimatedCursorProps) => {
  const Theme = useTheme();
  const opacity = useSharedValue(1);

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
  }, [isFocused, opacity, blinkEnabled]);

  // Scale height directly instead of transform to avoid position shift
  const scaledHeight = CURSOR_HEIGHT * scale;
  const topPosition = (containerHeight - scaledHeight) / 2;

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
      height: withTiming(scaledHeight, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        {
          translateX: withTiming(cursorPosition, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          }),
        },
        {
          translateY: withTiming(topPosition, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    }),
    [cursorPosition, scaledHeight, topPosition],
  );

  if (!isFocused) return null;

  return (
    <Animated.View
      style={[
        styles.cursor,
        animatedStyle,
        { backgroundColor: Theme["bg-accent-primary"] },
      ]}
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
