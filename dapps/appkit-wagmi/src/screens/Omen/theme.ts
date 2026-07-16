/**
 * Omen host skin — a branded, intentionally dark palette (NOT AppKit's `useTheme()` tokens).
 * Mirrors the web demo (apps/deposit-demo/src/index.css): zinc surfaces + a violet accent
 * (oklch(0.55 0.24 288) ≈ #7c3aed) and an emerald credit color. Single source for the Omen screen.
 */
export const OMEN_COLORS = {
  bg: '#09090b',
  surface: '#18181b',
  surfaceRaised: '#27272a',
  textPrimary: '#f4f4f5',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textFaint: '#52525b',
  accent: '#7c3aed',
  accentSoft: '#8b5cf6',
  credit: '#34d399',
  creditTint: 'rgba(52, 211, 153, 0.15)',
  border: '#27272a',
} as const;
