/**
 * Currency configuration for POS app
 */
export type SymbolPosition = "left" | "right";

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  unit: string;
  symbolPosition: SymbolPosition;
}

export type CurrencyCode = "USD" | "EUR";

export const CURRENCIES: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    unit: "iso4217/USD",
    symbolPosition: "left",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    unit: "iso4217/EUR",
    symbolPosition: "right",
  },
];

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/**
 * Format amount with currency symbol in correct position
 * @param amount - The numeric amount as a string (e.g., "10.00")
 * @param currency - Currency object with symbol and position info
 * @returns Formatted string (e.g., "$10.00" for USD, "10.00€" for EUR)
 */
export function formatAmountWithSymbol(
  amount: string,
  currency: Currency,
): string {
  return currency.symbolPosition === "left"
    ? `${currency.symbol}${amount}`
    : `${amount}${currency.symbol}`;
}

/**
 * Convert amount to cents. Uses Math.round() to avoid floating-point issues (9.2 * 100 = 919.999...)
 * @see https://github.com/nijikokun/dollars-to-cents - Stripe ecosystem standard
 */
export const amountToCents = (amount: string): number =>
  Math.round(parseFloat(amount) * 100);

const U64_MAX = BigInt("18446744073709551615");

/**
 * Check if a dollar amount string, when converted to cents, exceeds the u64 max.
 * Uses BigInt and string manipulation (not floating-point) for precision.
 */
export function exceedsU64Max(dollarAmount: string): boolean {
  if (!dollarAmount || dollarAmount === "." || dollarAmount === "0.") {
    return false;
  }
  const parts = dollarAmount.includes(".")
    ? dollarAmount.split(".")
    : [dollarAmount];
  const whole = (parts[0] || "0").replace(/^0+/, "") || "0";
  const fractional = (parts[1] || "").padEnd(2, "0").slice(0, 2);
  return BigInt(whole + fractional) > U64_MAX;
}

/**
 * Extract currency code from CAIP format (e.g., "iso4217/USD" -> "USD")
 */
export function extractCurrencyCode(currency?: string): string {
  if (!currency) return "USD";
  return currency.includes("/") ? currency.split("/")[1] : currency;
}

/**
 * Format fiat amount from cents to display string
 * @param amount - Amount in cents (e.g., 1000 = $10.00)
 * @param currency - Currency in CAIP format (e.g., "iso4217/USD")
 * @returns Formatted string (e.g., "$10.00" for USD, "10.00€" for EUR)
 */
export function formatFiatAmount(amount?: number, currency?: string): string {
  if (amount === undefined) return "-";

  // Convert cents to dollars
  const value = amount / 100;
  const currencyCode = extractCurrencyCode(currency);
  const currencyData = getCurrency(currencyCode);

  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatAmountWithSymbol(formattedValue, currencyData);
}
