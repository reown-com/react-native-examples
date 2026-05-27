import { Platform } from "react-native";

/**
 * Color tokens. Keys mirror the pos-app theme so ported components keep working,
 * with additional accent/status tokens used by the merchant POS UI. Dark values
 * follow the merchant-pos prototype palette (bg #0f0f0f, accent #3b99fc).
 */
export const Colors = {
  light: {
    // Foreground / surfaces
    "foreground-primary": "#FFFFFF",
    "foreground-secondary": "#F3F3F3",
    "foreground-tertiary": "#E4E4E4",
    "foreground-accent-primary-10": "#3B99FC1A",
    "foreground-accent-primary-40": "#3B99FC40",
    "foreground-accent-primary-60": "#3B99FC60",

    // Icons
    "icon-default": "#8A8A8A",
    "icon-invert": "#FFFFFF",
    "icon-success": "#22C55E",
    "icon-accent-primary": "#3B99FC",
    "icon-error": "#EF4444",

    // Backgrounds
    "bg-primary": "#FFFFFF",
    "bg-secondary": "#F6F6F6",
    "bg-invert": "#0F0F0F",
    "bg-accent-primary": "#3B99FC",
    "bg-payment-success": "#22C55E",

    // Text
    "text-primary": "#0F0F0F",
    "text-secondary": "#6C6C6C",
    "text-tertiary": "#9A9A9A",
    "text-invert": "#FFFFFF",
    "text-white": "#FFFFFF",
    "text-accent-primary": "#3B99FC",
    "text-success": "#16A34A",
    "text-error": "#DC2626",
    "text-warning": "#B45309",
    "text-payment-success": "#FFFFFF",

    // Borders
    "border-primary": "#E4E4E4",
    "border-secondary": "#D0D0D0",
    "border-accent-primary": "#3B99FC",
    "border-payment-success": "#22C55E",

    // Status surfaces
    "surface-accent": "#3B99FC1A",
    "surface-success": "#22C55E1A",
    "surface-error": "#EF44441A",
    "surface-warning": "#F59E0B1A",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  },
  dark: {
    // Foreground / surfaces
    "foreground-primary": "#1A1A1A",
    "foreground-secondary": "#242424",
    "foreground-tertiary": "#2E2E2E",
    "foreground-accent-primary-10": "#3B99FC1A",
    "foreground-accent-primary-40": "#3B99FC40",
    "foreground-accent-primary-60": "#3B99FC60",

    // Icons
    "icon-default": "#8A8A8A",
    "icon-invert": "#0F0F0F",
    "icon-success": "#22C55E",
    "icon-accent-primary": "#3B99FC",
    "icon-error": "#EF4444",

    // Backgrounds
    "bg-primary": "#0F0F0F",
    "bg-secondary": "#161616",
    "bg-invert": "#FFFFFF",
    "bg-accent-primary": "#3B99FC",
    "bg-payment-success": "#22C55E",

    // Text
    "text-primary": "#F5F5F5",
    "text-secondary": "#8A8A8A",
    "text-tertiary": "#555555",
    "text-invert": "#0F0F0F",
    "text-white": "#FFFFFF",
    "text-accent-primary": "#3B99FC",
    "text-success": "#22C55E",
    "text-error": "#EF4444",
    "text-warning": "#F59E0B",
    "text-payment-success": "#FFFFFF",

    // Borders
    "border-primary": "#2A2A2A",
    "border-secondary": "#363636",
    "border-accent-primary": "#3B99FC",
    "border-payment-success": "#22C55E",

    // Status surfaces
    "surface-accent": "#3B99FC1A",
    "surface-success": "#22C55E1A",
    "surface-error": "#EF44441A",
    "surface-warning": "#F59E0B1A",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  },
};

export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Brand colors for chains / tokens (used by inline SVG marks). */
export const Brand = {
  ethereum: "#627EEA",
  solanaFrom: "#9945FF",
  solanaTo: "#14F195",
  usdc: "#2775CA",
  usdt: "#26A17B",
  dai: "#F5AC37",
};

export const Fonts = Platform.select({
  ios: {
    sans: "KH Teka",
    mono: "ui-monospace",
  },
  default: {
    sans: "KH Teka",
    mono: "monospace",
  },
  web: {
    sans: "KH Teka, system-ui, -apple-system, sans-serif",
    mono: "SFMono-Regular, Menlo, monospace",
  },
});
