import { Platform } from "react-native";

/**
 * Colour tokens from the WalletConnect design system (@walletconnect/ui-tokens),
 * resolved from the published guidelines site:
 * https://walletconnect-design-system-guidelines.vercel.app/tokens-semantic.css
 *
 * Each key is the design system token path with "/" replaced by "-"
 * (fill/primary/default → "fill-primary-default"), so moving to the package
 * later is a lookup, not a rename. When a token changes upstream, update the
 * value here.
 */
export const Colors = {
  light: {
    // Surface
    "surface-default": "#FFFFFF",

    // Fill
    "fill-default-strong": "#F4F4F5",
    "fill-default-off": "#E3E3E3",
    "fill-selected-default": "#E4EEFF",
    "fill-inverse-default": "#1C180D",
    "fill-inverse-disabled": "#F1F4F7",
    "fill-primary-default": "#0666FF",
    "fill-primary-disabled": "#F1F4F7",
    "fill-success-subtle": "#F6FEF9",
    "fill-error-subtle": "#FEF3F2",
    "fill-warning-default": "#FFFBE6",
    "fill-warning-subtle": "#FFFBE6",
    "fill-warning-strong": "#FFBA24",

    // Content
    "content-default": "#1C180D",
    "content-subtle": "#697077",
    "content-inverse": "#FFFFFF",
    "content-disabled": "#BABCBE",
    "content-primary-on-primary": "#FFFFFF",
    "content-primary-on-selected": "#0057E2",
    "content-warning-on-warning": "#1C180D",

    // Icon
    "icon-default": "#1C180D",
    "icon-subtle": "#697077",
    "icon-primary-default": "#0666FF",
    "icon-success-default": "#008056",
    "icon-error-default": "#D40912",
    "icon-warning-default": "#B35005",

    // Border
    "border-default": "#BABCBE",
    "border-subtle": "#E3E3E3",
    "border-primary-default": "#0666FF",
    "border-neutral-disabled": "#F4F4F5",
  },
  dark: {
    // Surface
    "surface-default": "#0E0E0E",

    // Fill
    "fill-default-strong": "#212326",
    "fill-default-off": "#2A2F35",
    "fill-selected-default": "#0666FF24",
    "fill-inverse-default": "#F8F9FB",
    "fill-inverse-disabled": "#212326",
    "fill-primary-default": "#0666FF",
    "fill-primary-disabled": "#2A2F35",
    "fill-success-subtle": "#134E484D",
    "fill-error-subtle": "#8D151B4D",
    "fill-warning-default": "#874D0099",
    "fill-warning-subtle": "#874D004D",
    "fill-warning-strong": "#FFBA24",

    // Content
    "content-default": "#F4F4F5",
    "content-subtle": "#878D96",
    "content-inverse": "#1C180D",
    "content-disabled": "#4D5358",
    "content-primary-on-primary": "#FFFFFF",
    "content-primary-on-selected": "#3E88FF",
    "content-warning-on-warning": "#1C180D",

    // Icon
    "icon-default": "#F4F4F5",
    "icon-subtle": "#878D96",
    "icon-primary-default": "#2B7DFF",
    "icon-success-default": "#20A96B",
    "icon-error-default": "#FF4646",
    "icon-warning-default": "#FFBA24",

    // Border
    "border-default": "#3B424C",
    "border-subtle": "#2A2F35",
    "border-primary-default": "#0666FF",
    "border-neutral-disabled": "#252525",
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
