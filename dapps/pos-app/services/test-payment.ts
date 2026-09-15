import { amountToCents } from "@/utils/currency";

/**
 * Test Mode reserves 0.02 as the deterministic declined-payment amount.
 * Every other validated amount completes successfully.
 */
export function isTestPaymentFailure(amount: string): boolean {
  return amountToCents(amount) === 2;
}
