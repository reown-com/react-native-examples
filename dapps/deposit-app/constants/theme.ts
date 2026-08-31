/**
 * Design tokens ported 1:1 from the WalletConnect Pay deposit-flow prototype
 * (wcpay-deposit-demo-v2.jsx). The prototype is a single light theme on a warm
 * off-white background, with an Inter / JetBrains Mono / Instrument Serif type
 * stack. Keep these values in sync with the prototype's CSS :root variables.
 */

export const colors = {
  bg: '#f4f4f0',
  surface: '#ffffff',
  surface2: '#faf9f5',
  surface3: '#f0efe9',
  border: '#e8e6df',
  border2: '#d8d6cf',
  text: '#0a0a0a',
  textDim: '#6b6b66',
  textDimmer: '#a3a39c',
  accent: '#3396ff',
  // 0x14 alpha = 20/255 ≈ 0.08 over the accent / success hues
  accentSoft: 'rgba(51,150,255,0.08)',
  accentHover: '#2580e6',
  success: '#16a34a',
  successSoft: 'rgba(22,163,74,0.08)',
  danger: '#dc2626',
} as const;

/**
 * Font family names match the keys exported by the @expo-google-fonts/* packages
 * loaded in app/_layout.tsx.
 */
export const fonts = {
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  serif: 'InstrumentSerif_400Regular',
} as const;

export const radius = {
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  pill: 999,
} as const;

/** Width (web only) at and above which the desktop layout is used. */
export const DESKTOP_BREAKPOINT = 900;
