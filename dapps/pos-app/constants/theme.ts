/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    // Legacy colors (for backward compatibility)
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: "#007BFF",
    primaryDark: "#0056b3",
    success: "#28A745",
    successLight: "#10B981",
    successBackground: "#ECFDF5",
    error: "#DC3545",
    errorLight: "#f8d7da",
    warning: "#FFC107",
    warningLight: "#fff3cd",
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
    border: "#ddd",
    borderLight: "#F3F4F6",
    cardBackground: "#EAEAEA",
    cardShadow: "#000",
    buttonDisabled: "#8a8a8a",
    placeholder: "#808080",
    white: "#FFFFFF",
    black: "#1a1a1a",

    // Foreground colors
    "foreground-primary": "#F3F3F3",
    "foreground-secondary": "#E9E9E9",
    "foreground-tertiary": "#D0D0D0",
    "foreground-accent-primary": "#0988F0",
    "foreground-accent-primary-10": "rgba(9, 136, 240, 0.1)",
    "foreground-accent-primary-40": "rgba(9, 136, 240, 0.4)",
    "foreground-accent-primary-60": "rgba(9, 136, 240, 0.6)",
    "foreground-accent-secondary": "#C7B994",
    "foreground-accent-secondary-10": "rgba(199, 185, 148, 0.1)",
    "foreground-accent-secondary-40": "rgba(199, 185, 148, 0.4)",
    "foreground-accent-secondary-60": "rgba(199, 185, 148, 0.6)",

    // Icon colors
    "icon-default": "#9A9A9A",
    "icon-invert": "#202020",
    "icon-accent-primary": "#0988F0",
    "icon-accent-secondary": "#C7B994",
    "icon-success": "#30A46B",
    "icon-error": "#DF4A34",
    "icon-warning": "#F3A13F",

    // Background colors
    "bg-primary": "#FFFFFF",
    "bg-invert": "#202020",
    "bg-accent-primary": "#0988F0",
    "bg-accent-certified": "#C7B994",
    "bg-success": "rgba(48, 164, 107, 0.2)",
    "bg-error": "rgba(223, 74, 52, 0.2)",
    "bg-warning": "rgba(243, 161, 63, 0.2)",

    // Text colors
    "text-primary": "#202020",
    "text-secondary": "#9A9A9A",
    "text-tertiary": "#6C6C6C",
    "text-invert": "#FFFFFF",
    "text-accent-primary": "#0988F0",
    "text-accent-secondary": "#C7B994",
    "text-success": "#30A46B",
    "text-error": "#DF4A34",
    "text-warning": "#F3A13F",

    // Border colors
    "border-primary": "#E9E9E9",
    "border-secondary": "#D0D0D0",
    "border-accent-primary": "#0988F0",
    "border-accent-secondary": "#C7B994",
    "border-success": "#30A46B",
    "border-error": "#DF4A34",
    "border-warning": "#F3A13F",
  },
  dark: {
    // Legacy colors (for backward compatibility)
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primary: "#007BFF",
    primaryDark: "#0056b3",
    success: "#28A745",
    successLight: "#10B981",
    successBackground: "#1a3d2e",
    error: "#DC3545",
    errorLight: "#3d1a1a",
    warning: "#FFC107",
    warningLight: "#3d3a1a",
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
    border: "#555",
    borderLight: "#3a3a3a",
    cardBackground: "#2a2a2a",
    cardShadow: "#000",
    buttonDisabled: "#555",
    placeholder: "#999",
    white: "#FFFFFF",
    black: "#1a1a1a",

    // Foreground colors
    "foreground-primary": "#252525",
    "foreground-secondary": "#2A2A2A",
    "foreground-tertiary": "#363636",
    "foreground-accent-primary": "#0988F0",
    "foreground-accent-primary-10": "rgba(9, 136, 240, 0.1)",
    "foreground-accent-primary-40": "rgba(9, 136, 240, 0.4)",
    "foreground-accent-primary-60": "rgba(9, 136, 240, 0.6)",
    "foreground-accent-secondary": "#C7B994",
    "foreground-accent-secondary-10": "rgba(199, 185, 148, 0.1)",
    "foreground-accent-secondary-40": "rgba(199, 185, 148, 0.4)",
    "foreground-accent-secondary-60": "rgba(199, 185, 148, 0.6)",

    // Icon colors
    "icon-default": "#9A9A9A",
    "icon-invert": "#FFFFFF",
    "icon-accent-primary": "#0988F0",
    "icon-accent-secondary": "#C7B994",
    "icon-success": "#30A46B",
    "icon-error": "#DF4A34",
    "icon-warning": "#F3A13F",

    // Background colors
    "bg-primary": "#202020",
    "bg-invert": "#FFFFFF",
    "bg-accent-primary": "#0988F0",
    "bg-accent-certified": "#C7B994",
    "bg-success": "rgba(48, 164, 107, 0.2)",
    "bg-error": "rgba(223, 74, 52, 0.2)",
    "bg-warning": "rgba(243, 161, 63, 0.2)",

    // Text colors
    "text-primary": "#FFFFFF",
    "text-secondary": "#9A9A9A",
    "text-tertiary": "#BBBBBB",
    "text-invert": "#202020",
    "text-accent-primary": "#0988F0",
    "text-accent-secondary": "#C7B994",
    "text-success": "#30A46B",
    "text-error": "#DF4A34",
    "text-warning": "#F3A13F",

    // Border colors
    "border-primary": "#363636",
    "border-secondary": "#4F4F4F",
    "border-accent-primary": "#0988F0",
    "border-accent-secondary": "#C7B994",
    "border-success": "#30A46B",
    "border-error": "#DF4A34",
    "border-warning": "#F3A13F",
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
