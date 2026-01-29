import type { StyleProp, ViewStyle } from "react-native";
import type { SupportedLocale } from "./utils/formatAmount";

export type BigAmountInputProps = {
  /**
   * Current raw value (e.g., "24.00" for $24.00)
   */
  value?: string;
  /**
   * Currency symbol to display (default: $)
   */
  currency?: string;
  /**
   * Locale for number formatting (en-US, fr-FR, de-DE, nl-NL)
   */
  locale?: SupportedLocale;
  /**
   * Placeholder text when empty
   */
  placeholder?: string;
  /**
   * Whether the input is focused (shows blinking cursor)
   */
  isFocused?: boolean;
  /**
   * Whether cursor blinks when focused
   * @default true
   */
  cursorBlinkEnabled?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
};
