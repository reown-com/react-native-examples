/**
 * Convert dollars to cents. Uses Math.round() to avoid floating-point issues (9.2 * 100 = 919.999...)
 * @see https://github.com/nijikokun/dollars-to-cents - Stripe ecosystem standard
 */
export const dollarsToCents = (amount: string): number =>
  Math.round(parseFloat(amount) * 100);

/**
 * Extract currency code from CAIP format (e.g., "iso4217/USD" -> "USD")
 */
export function extractCurrencyCode(currency?: string): string {
  if (!currency) return "USD";
  return currency.includes("/") ? currency.split("/")[1] : currency;
}

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  return currencyCode === "EUR" ? "\u20AC" : "$";
}

/**
 * Format fiat amount from cents to display string
 * @param amount - Amount in cents (e.g., 1000 = $10.00)
 * @param currency - Currency in CAIP format (e.g., "iso4217/USD")
 * @returns Formatted string (e.g., "10.00$")
 */
export function formatFiatAmount(amount?: number, currency?: string): string {
  if (amount === undefined) return "-";

  // Convert cents to dollars
  const value = amount / 100;
  const currencyCode = extractCurrencyCode(currency);
  const symbol = getCurrencySymbol(currencyCode);

  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formattedValue}${symbol}`;
}
