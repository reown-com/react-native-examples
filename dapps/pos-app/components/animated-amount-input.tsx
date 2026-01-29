import { useTheme } from "@/hooks/use-theme-color";
import { memo, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutRight,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AnimatedAmountInputProps {
  value: string;
  currencySymbol?: string;
  maxFontSize?: number;
  minFontSize?: number;
}

interface CharacterData {
  char: string;
  key: string;
  isPlaceholder: boolean;
}

const getDecimalPlaceholder = (value: string): string => {
  if (!value.includes(".")) {
    return "";
  }
  const decimalPart = value.split(".")[1] || "";
  if (decimalPart.length === 0) {
    return "00";
  }
  if (decimalPart.length === 1) {
    return "0";
  }
  return "";
};

const AnimatedAmountInput = memo(function AnimatedAmountInput({
  value,
  currencySymbol = "$",
  maxFontSize = 56,
  minFontSize = 24,
}: AnimatedAmountInputProps) {
  const Theme = useTheme();
  const cursorOpacity = useSharedValue(1);
  const fontSize = useSharedValue(maxFontSize);
  const containerWidth = useSharedValue(0);

  // Blinking cursor animation
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, [cursorOpacity]);

  // Calculate display value and characters
  const { characters, displayValue } = useMemo(() => {
    const placeholder = getDecimalPlaceholder(value);
    const displayVal = value || "0";
    const fullDisplay = `${currencySymbol}${displayVal}${placeholder}`;

    const chars: CharacterData[] = [];

    // Add currency symbol
    chars.push({
      char: currencySymbol,
      key: "currency",
      isPlaceholder: !value,
    });

    // Add value characters (or "0" if empty)
    const valueToShow = value || "0";
    for (let i = 0; i < valueToShow.length; i++) {
      chars.push({
        char: valueToShow[i],
        key: `val-${i}-${valueToShow[i]}`,
        isPlaceholder: !value,
      });
    }

    // Add placeholder characters
    for (let i = 0; i < placeholder.length; i++) {
      chars.push({
        char: placeholder[i],
        key: `placeholder-${i}`,
        isPlaceholder: true,
      });
    }

    return { characters: chars, displayValue: fullDisplay };
  }, [value, currencySymbol]);

  // Calculate font size based on content length
  useEffect(() => {
    const charCount = displayValue.length;
    // Estimate when to start shrinking (around 8-9 characters for typical widths)
    const shrinkThreshold = 8;

    if (charCount > shrinkThreshold) {
      const scale = shrinkThreshold / charCount;
      const newSize = Math.max(minFontSize, maxFontSize * scale);
      fontSize.value = withTiming(newSize, { duration: 150 });
    } else {
      fontSize.value = withTiming(maxFontSize, { duration: 150 });
    }
  }, [displayValue, fontSize, maxFontSize, minFontSize]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
    height: fontSize.value * 0.7,
  }));

  const fontSizeStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
    lineHeight: fontSize.value * 1.1,
  }));

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        containerWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <Animated.View style={styles.textContainer} layout={LinearTransition}>
        {characters.map(({ char, key, isPlaceholder }) => (
          <Animated.Text
            key={key}
            entering={FadeInRight.duration(150)}
            exiting={FadeOutRight.duration(150)}
            style={[
              styles.character,
              fontSizeStyle,
              {
                color: isPlaceholder
                  ? Theme["text-secondary"]
                  : Theme["text-primary"],
                fontFamily: "KH Teka",
              },
            ]}
          >
            {char}
          </Animated.Text>
        ))}
        <Animated.View
          style={[
            styles.cursor,
            cursorStyle,
            { backgroundColor: Theme["text-primary"] },
          ]}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  character: {
    fontWeight: "400",
  },
  cursor: {
    width: 2,
    marginLeft: 2,
    borderRadius: 1,
  },
});

export { AnimatedAmountInput };
