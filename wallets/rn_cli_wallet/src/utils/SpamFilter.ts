// Filters scam/airdrop tokens that disguise advertising in their symbol field.
// Ported from reown-swift PR #312 (isSpam). Inspects only the token symbol:
//   1. URL substrings (http://, https://, www., ://)
//   2. Domain-like patterns (e.g. "2base.cfd")
//   3. Brackets used for promos (e.g. "USD0 [www.usual.finance]")
//   4. A blocklist of known-bad symbols

// Known spam symbols (normalized: trimmed + uppercased).
const SPAM_SYMBOLS = new Set([
  'MANTRA POS',
  'AMPAR',
  'ACHIVX',
  'BASED',
  'GT',
  'MY',
]);

// Matches domain-like segments such as "name.tld" (e.g. "2base.cfd", "gftpepe.com").
const DOMAIN_REGEX = /[a-z0-9][a-z0-9-]*\.[a-z]{2,}/i;

export function isSpamToken(symbol: string): boolean {
  if (!symbol) {
    return false;
  }

  const lower = symbol.toLowerCase();

  // 1. Explicit URLs / protocols
  if (
    lower.includes('http://') ||
    lower.includes('https://') ||
    lower.includes('www.') ||
    lower.includes('://')
  ) {
    return true;
  }

  // 2. Domain-like patterns
  if (DOMAIN_REGEX.test(symbol)) {
    return true;
  }

  // 3. Bracketed advertising
  if (symbol.includes('[') || symbol.includes(']')) {
    return true;
  }

  // 4. Blocklist match
  const normalized = symbol.trim().toUpperCase();
  if (SPAM_SYMBOLS.has(normalized)) {
    return true;
  }

  return false;
}
