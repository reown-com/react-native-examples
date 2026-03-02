import type { SupportedLocale, SymbolPosition } from "../utils/formatAmount";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { AnimatedCursor } from "./AnimatedCursor";
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
  isFocused?: boolean;
  cursorBlinkEnabled?: boolean;
};

export const AnimatedNumber = ({
  value,
  currency = "$",
  symbolPosition = "left",
  locale,
  placeholder = "0.00",
  isFocused = false,
  cursorBlinkEnabled = true,
}: AnimatedNumberProps) => {
  const { characters, separators, isEmpty, decimalSeparator } =
    useAnimatedNumberValue({
      value,
      currency,
      symbolPosition,
      locale,
      placeholder,
    });
  const layout = useAnimatedNumberLayout({ characters, separators, isEmpty });

  const containerStyle = useAnimatedStyle(
    () => ({
      width: withTiming(layout.totalContentWidth, TIMING_CONFIG),
      height: layout.itemHeight,
    }),
    [layout.totalContentWidth, layout.itemHeight],
  );

  return (
    <Animated.View style={containerStyle}>
      <AnimatedNumberCharacters
        characters={characters}
        separators={separators}
        isEmpty={isEmpty}
        decimalSeparator={decimalSeparator}
        layout={layout}
      />
      <AnimatedCursor
        isFocused={isFocused}
        cursorPosition={layout.cursorPosition}
        scale={layout.scale}
        blinkEnabled={cursorBlinkEnabled}
        containerHeight={layout.itemHeight}
      />
    </Animated.View>
  );
};
