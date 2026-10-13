import { amountToCents } from "@/utils/currency";

/**
 * Test Mode reserves 0.02 as the deterministic declined-payment amount.
 * Every other validated amount completes successfully.
 */
export function isTestPaymentFailure(amount: string): boolean {
  return amountToCents(amount) === 2;
}

const TEST_RECEIPT_DELAY_MS = 1000;

/** Test Mode payments get a local `test_…` id instead of a real payment ID. */
export function isTestPaymentId(paymentId: string): boolean {
  return paymentId.startsWith("test_");
}

/**
 * Test Mode has no real payment to email, so pretend the send succeeded.
 */
export async function simulateTestReceipt(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, TEST_RECEIPT_DELAY_MS));
}
