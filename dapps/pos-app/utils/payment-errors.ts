interface PaymentErrorMessage {
  title: string;
  subtitle: string;
}

const DEFAULT_ERROR: PaymentErrorMessage = {
  title: "This payment didn't go through",
  subtitle:
    "No funds were moved. Start a new payment, or check your connection and try again.",
};

const ERROR_MESSAGES: Record<string, PaymentErrorMessage> = {
  expired: {
    title: "This payment expired",
    subtitle: "No funds were moved. Start a new payment.",
  },
  cancelled: {
    title: "Payment cancelled",
    subtitle: "No funds were moved. Start a new payment when you're ready.",
  },
  invalid_api_key: {
    title: "This payment didn't go through",
    subtitle:
      "Your API key is invalid. No funds were moved. Check your credentials in Settings and try again.",
  },
};

/**
 * Converts payment error statuses to user-friendly title and subtitle
 * @param errorStatus - The error status from the API (e.g., "expired")
 * @returns Object with title and subtitle for the error screen
 */
export function getPaymentErrorMessage(
  errorStatus?: string,
): PaymentErrorMessage {
  if (!errorStatus) {
    return DEFAULT_ERROR;
  }

  return ERROR_MESSAGES[errorStatus] || DEFAULT_ERROR;
}
