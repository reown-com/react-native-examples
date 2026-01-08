/**
 * Converts payment error statuses to user-friendly error messages
 * @param errorStatus - The error status from the API (e.g., "expired")
 * @returns User-friendly error message
 */
export function getPaymentErrorMessage(errorStatus?: string): string {
  if (!errorStatus) {
    return "The payment couldn't be completed due to an error. Please try again or use a different payment method.";
  }

  const errorMessages: Record<string, string> = {
    expired: "The payment has expired.",
    invalid_api_key:
      "The API key is invalid. Please check your credentials and try again.",
  };

  return (
    errorMessages[errorStatus] ||
    "The payment couldn't be completed due to an error. Please try again or use a different payment method."
  );
}
