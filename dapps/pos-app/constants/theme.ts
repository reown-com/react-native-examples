/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    // Primary colors
    primary: "#007BFF",
    primaryDark: "#0056b3",

    // Success colors
    success: "#28A745",
    successLight: "#10B981",
    successBackground: "#ECFDF5",

    // Error colors
    error: "#DC3545",
    errorLight: "#f8d7da",

    // Warning colors
    warning: "#FFC107",
    warningLight: "#fff3cd",

    // Neutral colors
    gray50: "#f8f9fa",
    gray100: "#f9f9f9",
    gray200: "#e3f2fd",
    gray300: "#ddd",
    gray400: "#ccc",
    gray500: "#808080",
    gray600: "#666",
    gray700: "#333",
    gray800: "#374151",
    gray900: "#1F2937",

    // Border colors
    border: "#ddd",
    borderLight: "#F3F4F6",

    // Card colors
    cardBackground: "#FFFFFF",
    cardShadow: "#000",

    // Button states
    buttonDisabled: "#8a8a8a",

    // Placeholder colors
    placeholder: "#808080",

    white: "#FFFFFF",
    black: "#1a1a1a",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    // Primary colors
    primary: "#007BFF",
    primaryDark: "#0056b3",

    // Success colors
    success: "#28A745",
    successLight: "#10B981",
    successBackground: "#1a3d2e",

    // Error colors
    error: "#DC3545",
    errorLight: "#3d1a1a",

    // Warning colors
    warning: "#FFC107",
    warningLight: "#3d3a1a",

    // Neutral colors
    gray50: "#2a2a2a",
    gray100: "#1f1f1f",
    gray200: "#3a3a3a",
    gray300: "#555",
    gray400: "#666",
    gray500: "#808080",
    gray600: "#999",
    gray700: "#ccc",
    gray800: "#d1d5db",
    gray900: "#f9fafb",

    // Border colors
    border: "#555",
    borderLight: "#3a3a3a",

    // Card colors
    cardBackground: "#2a2a2a",
    cardShadow: "#000",

    // Button states
    buttonDisabled: "#555",

    // Placeholder colors
    placeholder: "#999",

    white: "#FFFFFF",
    black: "#1a1a1a",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
