import type { CharacterItem } from "../utils/getCharactersArray";
import { useTheme } from "@/hooks/use-theme-color";
import { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { ExitAnimationsValues } from "react-native-reanimated";

const easeOutExpo = Easing.out(Easing.exp);
const TIMING_CONFIG = { duration: 200, easing: easeOutExpo };

const exitAnimation = (_values: ExitAnimationsValues) => {
  "worklet";
  return {
    animations: {
      opacity: withTiming(0, TIMING_CONFIG),
      transform: [{ translateY: withTiming(10, TIMING_CONFIG) }],
    },
    initialValues: {
      opacity: 1,
      transform: [{ translateY: 0 }],
    },
  };
};

type AnimatedCharacterProps = {
  item: CharacterItem;
  scale: number;
  characterWidth: number;
  itemHeight: number;
  positionX: number;
  isPlaceholder?: boolean;
};

function AnimatedCharacterComponent({
  item,
  scale,
  characterWidth,
  itemHeight,
  positionX,
  isPlaceholder = false,
}: AnimatedCharacterProps) {
  const Theme = useTheme();

  const translateY = useSharedValue(10);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, TIMING_CONFIG);
    opacity.value = withTiming(1, TIMING_CONFIG);
  }, [translateY, opacity]);

  // Compensate for scale origin: RN scales from center, so we offset
  // by half the width * (1 - scale) to simulate left-origin scaling
  const scaleOffsetX = (characterWidth * (1 - scale)) / 2;

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
      transform: [
        {
          translateX: withTiming(positionX - scaleOffsetX, TIMING_CONFIG),
        },
        { translateY: translateY.value },
        { scale: withTiming(scale, TIMING_CONFIG) },
      ],
    }),
    [positionX, scale, scaleOffsetX],
  );

  const isPlaceholderChar = isPlaceholder || item.isPlaceholderDecimal;
  const textColor = isPlaceholderChar
    ? Theme["text-secondary"]
    : Theme["text-primary"];

  return (
    <Animated.View exiting={exitAnimation}>
      <Animated.View
        style={[
          styles.container,
          { width: characterWidth, height: itemHeight },
          animatedStyle,
        ]}
      >
        <Animated.Text style={[styles.text, { color: textColor }]}>
          {item.char}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

export const AnimatedCharacter = memo(AnimatedCharacterComponent);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    justifyContent: "center",
  },
  text: {
    fontFamily: "KH Teka",
    fontSize: 64,
    position: "absolute",
    textAlign: "center",
  },
});
