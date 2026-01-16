import { ThemeKeys } from './TypesUtil';

// Spacing constants (in pixels)
export const Spacing = {
  0: 0,
  '05': 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 48,
  12: 56,
  13: 64,
  'extra-1': 80,
  'extra-2': 128,
  'extra-3': 256,
  'extra-4': 512,
} as const;

// Border radius constants (in pixels)
export const BorderRadius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 48,
  12: 56,
  13: 64,
  full: 9999,
} as const;

export const LightTheme: { [key in ThemeKeys]: string } = {
  // Background
  'bg-primary': '#FFFFFF',
  'bg-invert': '#202020',
  'bg-accent-primary': '#0988F0',
  'bg-accent-certified': '#C7B994',
  'bg-success': 'rgba(48, 164, 107, 0.2)',
  'bg-error': 'rgba(223, 74, 52, 0.2)',
  'bg-warning': 'rgba(243, 161, 63, 0.2)',

  // Text
  'text-primary': '#202020',
  'text-secondary': '#9A9A9A',
  'text-tertiary': '#6C6C6C',
  'text-invert': '#FFFFFF',
  'text-accent-primary': '#0988F0',
  'text-accent-secondary': '#C7B994',
  'text-success': '#30A46B',
  'text-error': '#DF4A34',
  'text-warning': '#F3A13F',

  // Border
  'border-primary': '#E9E9E9',
  'border-secondary': '#D0D0D0',
  'border-accent-primary': '#0988F0',
  'border-accent-secondary': '#C7B994',
  'border-success': '#30A46B',
  'border-error': '#DF4A34',
  'border-warning': '#F3A13F',

  // Foreground
  'foreground-primary': '#F3F3F3',
  'foreground-secondary': '#E9E9E9',
  'foreground-tertiary': '#D0D0D0',
  'foreground-accent-primary-10': 'rgba(9, 136, 240, 0.1)',
  'foreground-accent-primary-10-solid': '#DCE8F3',
  'foreground-accent-primary-40': 'rgba(9, 136, 240, 0.4)',
  'foreground-accent-primary-60': 'rgba(9, 136, 240, 0.6)',
  'foreground-accent-secondary-10': 'rgba(199, 185, 148, 0.1)',
  'foreground-accent-secondary-40': 'rgba(199, 185, 148, 0.4)',
  'foreground-accent-secondary-60': 'rgba(199, 185, 148, 0.6)',

  // Icon
  'icon-default': '#9A9A9A',
  'icon-invert': '#202020',
  'icon-accent-primary': '#0988F0',
  'icon-accent-secondary': '#C7B994',
  'icon-success': '#30A46B',
  'icon-error': '#DF4A34',
  'icon-warning': '#F3A13F',
};

export const DarkTheme: { [key in ThemeKeys]: string } = {
  // Background
  'bg-primary': '#202020',
  'bg-invert': '#FFFFFF',
  'bg-accent-primary': '#0988F0',
  'bg-accent-certified': '#C7B994',
  'bg-success': 'rgba(48, 164, 107, 0.2)',
  'bg-error': 'rgba(223, 74, 52, 0.2)',
  'bg-warning': 'rgba(243, 161, 63, 0.2)',

  // Text
  'text-primary': '#FFFFFF',
  'text-secondary': '#9A9A9A',
  'text-tertiary': '#BBBBBB',
  'text-invert': '#202020',
  'text-accent-primary': '#0988F0',
  'text-accent-secondary': '#C7B994',
  'text-success': '#30A46B',
  'text-error': '#DF4A34',
  'text-warning': '#F3A13F',

  // Border
  'border-primary': '#363636',
  'border-secondary': '#4F4F4F',
  'border-accent-primary': '#0988F0',
  'border-accent-secondary': '#C7B994',
  'border-success': '#30A46B',
  'border-error': '#DF4A34',
  'border-warning': '#F3A13F',

  // Foreground
  'foreground-primary': '#252525',
  'foreground-secondary': '#2A2A2A',
  'foreground-tertiary': '#363636',
  'foreground-accent-primary-10': 'rgba(9, 136, 240, 0.1)',
  'foreground-accent-primary-10-solid': '#DCE8F3',
  'foreground-accent-primary-40': 'rgba(9, 136, 240, 0.4)',
  'foreground-accent-primary-60': 'rgba(9, 136, 240, 0.6)',
  'foreground-accent-secondary-10': 'rgba(199, 185, 148, 0.1)',
  'foreground-accent-secondary-40': 'rgba(199, 185, 148, 0.4)',
  'foreground-accent-secondary-60': 'rgba(199, 185, 148, 0.6)',

  // Icon
  'icon-default': '#9A9A9A',
  'icon-invert': '#FFFFFF',
  'icon-accent-primary': '#0988F0',
  'icon-accent-secondary': '#C7B994',
  'icon-success': '#30A46B',
  'icon-error': '#DF4A34',
  'icon-warning': '#F3A13F',
};
