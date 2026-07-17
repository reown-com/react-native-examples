import type { SupportedLocale, SymbolPosition } from "../utils/formatAmount";
import { useTheme } from "@/hooks/use-theme-color";
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AnimatedNumberCharacters } from "./AnimatedNumberCharacters";
import { useAnimatedNumberLayout } from "../hooks/useAnimatedNumberLayout";
import { useAnimatedNumberValue } from "../hooks/useAnimatedNumberValue";

const easeOutExpo = Easing.out(Easing.exp);
const TIMING_CONFIG = { duration: 200, easing: easeOutExpo };

type AnimatedNumberProps = {
  value: string;
  currency?: string;
  symbolPosition?: SymbolPosition;
  locale?: SupportedLocale;
  placeholder?: string;
};

export const AnimatedNumber = ({
  value,
  currency = "$",
  symbolPosition = "left",
  locale,
  placeholder = "0.00",
}: AnimatedNumberProps) => {
  const Theme = useTheme();
  const { characters, separators, isEmpty, decimalSeparator } =
    useAnimatedNumberValue({
      value,
      currency,
      symbolPosition,
      locale,
      placeholder,
    });
  const layout = useAnimatedNumberLayout({ characters, separators });

  const animatedWidth = useSharedValue(layout.totalContentWidth);

  useEffect(() => {
    animatedWidth.value = withTiming(layout.totalContentWidth, TIMING_CONFIG);
  }, [layout.totalContentWidth, animatedWidth]);

  const containerStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
    height: layout.itemHeight,
  }));

  return (
    <Animated.View style={containerStyle}>
      <AnimatedNumberCharacters
        characters={characters}
        separators={separators}
        isEmpty={isEmpty}
        decimalSeparator={decimalSeparator}
        layout={layout}
        textPrimaryColor={Theme["text-primary"]}
        textSecondaryColor={Theme["text-secondary"]}
        textTertiaryColor={Theme["text-tertiary"]}
      />
    </Animated.View>
  );
};
