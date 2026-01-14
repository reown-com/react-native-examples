/**
 * Convert dollars to cents. Uses Math.round() to avoid floating-point issues (9.2 * 100 = 919.999...)
 * @see https://github.com/nijikokun/dollars-to-cents - Stripe ecosystem standard
 */
export const dollarsToCents = (amount: string): number =>
  Math.round(parseFloat(amount) * 100);
