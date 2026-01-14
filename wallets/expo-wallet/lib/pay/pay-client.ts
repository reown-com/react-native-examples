/**
 * WalletConnect Pay Client
 *
 * Re-exports the PayClient and provider utilities from @walletconnect/pay SDK.
 */

// Re-export PayClient class
export { PayClient } from '@walletconnect/pay';

// Re-export provider utilities
export {
  isProviderAvailable,
  detectProviderType,
  isNativeProviderAvailable,
  setNativeModule,
} from '@walletconnect/pay';

// ============================================================================
// Helper: Check if a URL is a WalletConnect Pay link
// ============================================================================

/**
 * Check if a URL is a WalletConnect Pay payment link.
 * Supports various formats:
 * - https://pay.walletconnect.com/...
 * - pay.walletconnect.com/...
 * - URLs with pid= parameter
 * - pay_xxx format
 */
export function isPaymentLink(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('pay.walletconnect.com') ||
    url.startsWith('wc:pay-') ||
    /^pay_[a-zA-Z0-9]+$/.test(url)
  );
}

/**
 * Extract and normalize a payment link from various URL formats.
 * Returns a clean payment link URL or null if invalid.
 */
export function extractPaymentLink(url: string): string | null {
  if (!url) return null;

  // Already a clean payment link with full URL
  if (url.startsWith('https://pay.walletconnect.com/')) {
    return url;
  }

  // Without https://
  if (url.startsWith('pay.walletconnect.com/')) {
    return `https://${url}`;
  }

  // Just the payment ID
  if (/^pay_[a-zA-Z0-9]+$/.test(url)) {
    return `https://pay.walletconnect.com/${url}`;
  }

  // URL with pid parameter (e.g., https://pay.walletconnect.com/?pid=pay_xxx)
  if (url.includes('pay.walletconnect.com') && url.includes('pid=')) {
    return url;
  }

  return null;
}
