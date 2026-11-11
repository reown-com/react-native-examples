import { Platform } from "react-native";

/**
 * Colour values come from the WalletConnect design system semantic tokens
 * (@walletconnect/ui-tokens), resolved from the published guidelines site:
 * https://walletconnect-design-system-guidelines.vercel.app/tokens-semantic.css
 * The token each key maps to is in the comment next to it. The keys keep their
 * existing names so screens don't change; when a token changes upstream,
 * update the value here.
 */
export const Colors = {
  light: {
    // Foreground colors (controls, tiles, keypad)
    "foreground-primary": "#F4F4F5", // fill/default/strong
    "foreground-primary-fix": "#F4F4F5", // fill/default/strong
    "foreground-secondary": "#E3E3E3", // fill/default/off
    "foreground-tertiary": "#BABCBE", // border/default
    "foreground-accent-primary-10": "#E4EEFF", // fill/selected/default
    // No token yet: Test Mode pill. The design system's test-environment cue
    // is fill/environment/test/default (peach), which is a design decision.
    "foreground-accent-primary-60": "#0666FF60",

    // Icon colors
    "icon-default": "#697077", // icon/subtle
    "icon-invert": "#1C180D", // icon/default
    "icon-success": "#008056", // icon/success/default
    "icon-accent-primary": "#0666FF", // icon/primary/default
    "icon-error": "#D40912", // icon/error/default
    "icon-warning": "#B35005", // icon/warning/default

    // Background colors
    "bg-primary": "#FFFFFF", // surface/default
    "bg-invert": "#1C180D", // fill/inverse/default
    "bg-accent-primary": "#0666FF", // fill/primary/default
    "bg-warning": "#FFFBE6", // fill/warning/default

    // Text colors
    "text-primary": "#1C180D", // content/default
    "text-secondary": "#697077", // content/subtle
    "text-tertiary": "#697077", // content/subtle
    "text-invert": "#FFFFFF", // content/inverse
    "text-white": "#FFFFFF", // content/primary/on-primary

    // Border colors
    "border-primary": "#E3E3E3", // border/subtle
    "border-secondary": "#BABCBE", // border/default
    "border-accent-primary": "#0666FF", // border/primary/default
  },
  dark: {
    // Foreground colors (controls, tiles, keypad)
    "foreground-primary": "#212326", // fill/default/strong
    "foreground-primary-fix": "#212326", // fill/default/strong
    "foreground-secondary": "#2A2F35", // fill/default/off
    "foreground-tertiary": "#3B424C", // border/default
    "foreground-accent-primary-10": "#0666FF24", // fill/selected/default
    // No token yet: Test Mode pill (see light).
    "foreground-accent-primary-60": "#0666FF60",

    // Icon colors
    "icon-default": "#878D96", // icon/subtle
    "icon-invert": "#F4F4F5", // icon/default
    "icon-success": "#20A96B", // icon/success/default
    "icon-accent-primary": "#2B7DFF", // icon/primary/default
    "icon-error": "#FF4646", // icon/error/default
    "icon-warning": "#FFBA24", // icon/warning/default

    // Background colors
    "bg-primary": "#0E0E0E", // surface/default
    "bg-invert": "#F8F9FB", // fill/inverse/default
    "bg-accent-primary": "#0666FF", // fill/primary/default
    "bg-warning": "#874D0099", // fill/warning/default

    // Text colors
    "text-primary": "#F4F4F5", // content/default
    "text-secondary": "#878D96", // content/subtle
    "text-tertiary": "#878D96", // content/subtle
    "text-invert": "#1C180D", // content/inverse
    "text-white": "#FFFFFF", // content/primary/on-primary

    // Border colors
    "border-primary": "#2A2F35", // border/subtle
    "border-secondary": "#3B424C", // border/default
    "border-accent-primary": "#0666FF", // border/primary/default
  },
};

export type ColorKey = keyof typeof Colors.light;

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
