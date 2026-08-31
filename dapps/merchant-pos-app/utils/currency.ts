/**
 * Fiat currency configuration for the POS amount entry.
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
 * Format amount with currency symbol in correct position.
 * e.g. "$10.00" for USD, "10.00€" for EUR.
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
 * Convert a dollar string to integer cents. Math.round avoids float drift
 * (e.g. 9.2 * 100 = 919.999...).
 */
export const amountToCents = (amount: string): number =>
  Math.round(parseFloat(amount || "0") * 100);

const U64_MAX = BigInt("18446744073709551615");

/** True when the dollar amount, in cents, would overflow a u64. */
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

/** Format integer cents to a display string with the currency symbol. */
export function formatCentsWithSymbol(
  cents: number,
  currencyCode: string,
): string {
  const currency = getCurrency(currencyCode);
  const value = cents / 100;
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatAmountWithSymbol(formatted, currency);
}
