/**
 * GoodWallet skin — a deliberately DISTINCT look from the Omen host (which is dark + violet). This
 * is a light, clean "trustworthy wallet" palette (emerald accent) so the deposit-confirm modal
 * reads as a separate wallet app that opened over Omen, not an Omen sub-screen.
 */
export const GOODWALLET_COLORS = {
  bg: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F4',
  textPrimary: '#0B0F14',
  textSecondary: '#5B6673',
  textMuted: '#8A94A3',
  accent: '#16A34A',
  accentSoft: '#22C55E',
  accentTint: 'rgba(22, 163, 74, 0.10)',
  border: '#E3E8EE',
  danger: '#DC2626',
} as const;
