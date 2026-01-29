import { StyleSheet, View } from "react-native";
import type { BigAmountInputProps } from "./BigAmountInput.types";
import { AnimatedNumber } from "./components/AnimatedNumber";

/**
 * Animated currency display with per-character animations.
 * This is a display-only component - use with NumericKeyboard for input.
 */
export const BigAmountInput = ({
  value = "",
  currency = "$",
  locale,
  placeholder = "0.00",
  isFocused = true,
  cursorBlinkEnabled = true,
  testID,
  style,
}: BigAmountInputProps) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <AnimatedNumber
        value={value}
        currency={currency}
        locale={locale}
        placeholder={placeholder}
        isFocused={isFocused}
        cursorBlinkEnabled={cursorBlinkEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    flex: 1,
    width: "100%",
  },
});
