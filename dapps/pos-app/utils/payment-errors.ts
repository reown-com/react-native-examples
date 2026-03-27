interface PaymentErrorMessage {
  title: string;
  subtitle: string;
}

const DEFAULT_ERROR: PaymentErrorMessage = {
  title: "Payment can't be completed",
  subtitle:
    "We're unable to complete this payment at this time. Please generate a new payment and try again.",
};

const ERROR_MESSAGES: Record<string, PaymentErrorMessage> = {
  expired: {
    title: "Your payment has expired",
    subtitle:
      "This payment request has expired. Please generate a new payment and try again.",
  },
  cancelled: {
    title: "Payment was cancelled",
    subtitle:
      "This payment was cancelled. Please generate a new payment and try again.",
  },
  invalid_api_key: {
    title: "Payment can't be completed",
    subtitle:
      "The API key is invalid. Please check your credentials and try again.",
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
