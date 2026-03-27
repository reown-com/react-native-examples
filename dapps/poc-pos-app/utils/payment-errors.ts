/**
 * Converts payment error codes to user-friendly error messages
 * @param errorCode - The error code from the API (e.g., "INSUFFICIENT_BALANCE")
 * @returns User-friendly error message
 */
export function getPaymentErrorMessage(errorCode?: string): string {
  if (!errorCode) {
    return "The payment couldn't be completed due to an error. Please try again or use a different payment method.";
  }

  const errorMessages: Record<string, string> = {
    INSUFFICIENT_BALANCE:
      "Insufficient balance. Please ensure you have enough funds to complete this payment.",
    // Add more error codes as needed
  };

  return (
    errorMessages[errorCode] ||
    "The payment couldn't be completed due to an error. Please try again or use a different payment method."
  );
}
