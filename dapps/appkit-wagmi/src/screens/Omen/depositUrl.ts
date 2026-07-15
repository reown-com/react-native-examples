import {getMetadata} from '@/utils/misc';

/**
 * BX deposit-flow route (branch preview Worker). This is a standalone "add money" surface that
 * posts DEPOSIT_COMPLETE / DEPOSIT_CANCELLED back over the RN WebView bridge — never a redirect.
 */
const BX_DEPOSIT_URL =
  'https://tomiir-bx-deposit-flow-poc-wc-pay-buyer-experience-dev.walletconnect-v1-bridge.workers.dev/deposit';

/** Omen's mock treasury (deposit destination). Burn address for the POC — no real funds implied. */
const OMEN_TREASURY = '0x000000000000000000000000000000000000dEaD';

/**
 * Build the deposit URL for the in-app WebView. Mirrors PasteUrlButton.buildPayUrl:
 * - `returnUrl` = our AppKit native deeplink, so wallets reopen this app after signing
 *   (BX maps it to the WC session redirect metadata).
 * - `preferUniversalLinks` = open wallets via universal links.
 * Plus the deposit-specific `to` (destination) and `app` (branding) params, and an optional
 * `amount` prefill.
 */
export function buildOmenDepositUrl(opts: {amount?: number} = {}): string {
  const url = new URL(BX_DEPOSIT_URL);
  url.searchParams.set('to', OMEN_TREASURY);
  url.searchParams.set('app', 'Omen');
  url.searchParams.set('returnUrl', getMetadata().redirect.native);
  url.searchParams.set('preferUniversalLinks', '1');
  if (opts.amount && opts.amount > 0) {
    url.searchParams.set('amount', String(opts.amount));
  }

  return url.toString();
}
