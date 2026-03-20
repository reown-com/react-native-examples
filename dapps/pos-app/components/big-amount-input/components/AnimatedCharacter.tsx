import type { CharacterItem } from "../utils/getCharactersArray";
import { memo, useEffect, useRef } from "react";
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
  textPrimaryColor: string;
  textSecondaryColor: string;
  textTertiaryColor: string;
};

function AnimatedCharacterComponent({
  item,
  scale,
  characterWidth,
  itemHeight,
  positionX,
  isPlaceholder = false,
  textPrimaryColor,
  textSecondaryColor,
  textTertiaryColor,
}: AnimatedCharacterProps) {
  // Compensate for scale origin: RN scales from center, so we offset
  // by half the width * (1 - scale) to simulate left-origin scaling
  const scaleOffsetX = (characterWidth * (1 - scale)) / 2;

  const translateY = useSharedValue(10);
  const opacity = useSharedValue(0);
  const animatedTranslateX = useSharedValue(positionX - scaleOffsetX);
  const animatedScale = useSharedValue(scale);
  const isMounted = useRef(false);

  useEffect(() => {
    translateY.value = withTiming(0, TIMING_CONFIG);
    opacity.value = withTiming(1, TIMING_CONFIG);
  }, [translateY, opacity]);

  useEffect(() => {
    if (!isMounted.current) return;
    animatedTranslateX.value = withTiming(
      positionX - scaleOffsetX,
      TIMING_CONFIG,
    );
  }, [positionX, scaleOffsetX, animatedTranslateX]);

  useEffect(() => {
    if (!isMounted.current) return;
    animatedScale.value = withTiming(scale, TIMING_CONFIG);
  }, [scale, animatedScale]);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: animatedTranslateX.value },
      { translateY: translateY.value },
      { scale: animatedScale.value },
    ],
  }));

  const textColor = isPlaceholder
    ? textSecondaryColor
    : item.isPlaceholderDecimal || item.isTertiaryCurrency
      ? textTertiaryColor
      : textPrimaryColor;

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
    fontFamily: "KH Teka Medium",
    fontSize: 64,
    letterSpacing: -1,
    position: "absolute",
    textAlign: "center",
  },
});
