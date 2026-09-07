/**
 * Format a number as a USD amount with thousands separators and exactly two
 * decimals, e.g. 2845.32 → "2,845.32". Implemented manually because Hermes'
 * Intl/toLocaleString support is inconsistent across platforms.
 */
export function formatUsd(value: number): string {
  const fixed = Math.abs(value).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = value < 0 ? '-' : '';
  return `${sign}${withSeparators}.${decPart}`;
}

/** Coarse relative time for activity timestamps (e.g. "Just now", "3h ago"). */
export function relativeTime(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
