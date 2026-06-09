/**
 * Convert dollars to cents. Uses Math.round() to avoid floating-point issues (9.2 * 100 = 919.999...)
 * @see https://github.com/nijikokun/dollars-to-cents - Stripe ecosystem standard
 */
export const dollarsToCents = (amount: string): number =>
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
