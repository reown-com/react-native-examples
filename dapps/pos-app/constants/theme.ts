import { Platform } from "react-native";

export const Colors = {
  light: {
    // Foreground colors
    "foreground-primary": "#F3F3F3",
    "foreground-secondary": "#E9E9E9",
    "foreground-tertiary": "#D0D0D0",
    "foreground-accent-primary-10": "#0988F01A", // 10% opacity
    "foreground-accent-primary-40": "#0988F040", // 40% opacity
    "foreground-accent-primary-60": "#0988F060", // 60% opacity

    // Icon colors
    "icon-default": "#9A9A9A",
    "icon-invert": "#202020",
    "icon-success": "#30A46B",
    "icon-accent-primary": "#0988F0",
    "icon-error": "#DF4A34",

    // Background colors
    "bg-primary": "#FFFFFF",
    "bg-invert": "#202020",
    "bg-accent-primary": "#0988F0",
    "bg-payment-success": "#0988F0",

    // Text colors
    "text-primary": "#202020",
    "text-secondary": "#9A9A9A",
    "text-tertiary": "#6C6C6C",
    "text-invert": "#FFFFFF",
    "text-white": "#FFFFFF",
    "text-payment-success": "#FFFFFF",

    // Border colors
    "border-primary": "#E9E9E9",
    "border-secondary": "#D0D0D0",
    "border-payment-success": "#E9E9E9",
    "border-accent-primary": "#0988F0",
  },
  dark: {
    // Foreground colors
    "foreground-primary": "#252525",
    "foreground-secondary": "#2A2A2A",
    "foreground-tertiary": "#363636",
    "foreground-accent-primary-10": "#0988F01A", // 10% opacity
    "foreground-accent-primary-40": "#0988F040", // 40% opacity
    "foreground-accent-primary-60": "#0988F060", // 60% opacity

    // Icon colors
    "icon-default": "#9A9A9A",
    "icon-invert": "#FFFFFF",
    "icon-success": "#30A46B",
    "icon-accent-primary": "#0988F0",
    "icon-error": "#DF4A34",

    // Background colors
    "bg-primary": "#202020",
    "bg-invert": "#FFFFFF",
    "bg-accent-primary": "#0988F0",
    "bg-payment-success": "#0988F0",

    // Text colors
    "text-primary": "#FFFFFF",
    "text-secondary": "#9A9A9A",
    "text-tertiary": "#BBBBBB",
    "text-invert": "#202020",
    "text-white": "#FFFFFF",
    "text-payment-success": "#FFFFFF",

    // Border colors
    "border-primary": "#363636",
    "border-secondary": "#4F4F4F",
    "border-payment-success": "#E9E9E9",
    "border-accent-primary": "#0988F0",
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
