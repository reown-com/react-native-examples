/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Foreground colors
    'foreground-primary': '#F3F3F3',
    'foreground-secondary': '#E9E9E9',
    'foreground-tertiary': '#D0D0D0',
    'foreground-accent-primary-10': 'rgba(9, 136, 240, 0.1)',
    'foreground-accent-primary-40': 'rgba(9, 136, 240, 0.4)',
    'foreground-accent-primary-60': 'rgba(9, 136, 240, 0.6)',
    'foreground-accent-certified-10': 'rgba(199, 185, 148, 0.1)',
    'foreground-accent-certified-40': 'rgba(199, 185, 148, 0.4)',
    'foreground-accent-certified-60': 'rgba(199, 185, 148, 0.6)',

    // Icon colors
    'icon-default': '#9A9A9A',
    'icon-inverse': '#202020',
    'icon-accent-primary': '#0988F0',
    'icon-accent-certified': '#C7B994',
    'icon-success': '#30A46B',
    'icon-error': '#DF4A34',
    'icon-warning': '#F3A13F',

    // Background colors
    'bg-primary': '#FFFFFF',
    'bg-invert': '#202020',
    'bg-accent-primary': '#0988F0',
    'bg-accent-certified': '#C7B994',
    'bg-walletkit': '#FFB800',
    'bg-appkit': '#FF573B',
    'bg-cloud': '#0988F0',
    'bg-docs': '#008847',
    'bg-success': 'rgba(48, 164, 107, 0.2)',
    'bg-error': 'rgba(223, 74, 52, 0.2)',
    'bg-warning': 'rgba(243, 161, 63, 0.2)',

    // Text colors
    'text-primary': '#202020',
    'text-secondary': '#9A9A9A',
    'text-tertiary': '#6C6C6C',
    'text-invert': '#FFFFFF',
    'text-accent-primary': '#0988F0',
    'text-accent-certified': '#C7B994',
    'text-walletkit': '#FFB800',
    'text-appkit': '#FF573B',
    'text-cloud': '#0988F0',
    'text-docs': '#008847',
    'text-success': '#30A46B',
    'text-error': '#DF4A34',
    'text-warning': '#F3A13F',

    // Border colors
    'border-primary': '#E9E9E9',
    'border-secondary': '#D0D0D0',
    'border-accent-primary': '#0988F0',
    'border-accent-certified': '#C7B994',
    'border-success': '#30A46B',
    'border-error': '#DF4A34',
    'border-warning': '#F3A13F',

    // Others
    white: '#FFFFFF',
    black: '#202020',
  },
  dark: {
    // Foreground colors
    'foreground-primary': '#252525',
    'foreground-secondary': '#2A2A2A',
    'foreground-tertiary': '#363636',
    'foreground-accent-primary-10': 'rgba(9, 136, 240, 0.1)',
    'foreground-accent-primary-40': 'rgba(9, 136, 240, 0.4)',
    'foreground-accent-primary-60': 'rgba(9, 136, 240, 0.6)',
    'foreground-accent-certified-10': 'rgba(199, 185, 148, 0.1)',
    'foreground-accent-certified-40': 'rgba(199, 185, 148, 0.4)',
    'foreground-accent-certified-60': 'rgba(199, 185, 148, 0.6)',

    // Icon colors
    'icon-default': '#9A9A9A',
    'icon-inverse': '#FFFFFF',
    'icon-accent-primary': '#0988F0',
    'icon-accent-certified': '#C7B994',
    'icon-success': '#30A46B',
    'icon-error': '#DF4A34',
    'icon-warning': '#F3A13F',

    // Background colors
    'bg-primary': '#202020',
    'bg-invert': '#FFFFFF',
    'bg-accent-primary': '#0988F0',
    'bg-accent-certified': '#C7B994',
    'bg-walletkit': '#FFB800',
    'bg-appkit': '#FF573B',
    'bg-cloud': '#0988F0',
    'bg-docs': '#008847',
    'bg-success': 'rgba(48, 164, 107, 0.2)',
    'bg-error': 'rgba(223, 74, 52, 0.2)',
    'bg-warning': 'rgba(243, 161, 63, 0.2)',

    // Text colors
    'text-primary': '#FFFFFF',
    'text-secondary': '#9A9A9A',
    'text-tertiary': '#BBBBBB',
    'text-invert': '#202020',
    'text-accent-primary': '#0988F0',
    'text-accent-certified': '#C7B994',
    'text-walletkit': '#FFB800',
    'text-appkit': '#FF573B',
    'text-cloud': '#0988F0',
    'text-docs': '#008847',
    'text-success': '#30A46B',
    'text-error': '#DF4A34',
    'text-warning': '#F3A13F',

    // Border colors
    'border-primary': '#363636',
    'border-secondary': '#4F4F4F',
    'border-accent-primary': '#0988F0',
    'border-accent-certified': '#C7B994',
    'border-success': '#30A46B',
    'border-error': '#DF4A34',
    'border-warning': '#F3A13F',

    // Others
    white: '#FFFFFF',
    black: '#202020',
  },
};

// TODO: Check this
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
