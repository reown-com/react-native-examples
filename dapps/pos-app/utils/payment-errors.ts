import { formatFiatAmount } from "./currency";

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
  params_validation: {
    title: "This payment didn't go through",
    subtitle:
      "No funds were moved. Something's off with this payment's details. Check your settings and start a new payment.",
  },
};

/** Synthetic code: the API reports this as a generic `params_validation`. */
export const AMOUNT_TOO_LOW = "amount_too_low";

// "Validation error: Amount must be at least 14 to cover fees" (14 = cents)
const MIN_AMOUNT_PATTERN = /amount must be at least\s+(\d+)/i;

/**
 * Extract the minimum amount in cents from an API error message
 * @param message - The error message from the API
 * @returns The minimum amount in cents, or undefined if not a below-minimum rejection
 */
export function parseMinAmountCents(message?: string): string | undefined {
  return message?.match(MIN_AMOUNT_PATTERN)?.[1];
}

interface PaymentErrorContext {
  minAmountCents?: string;
  currencyCode?: string;
}

/**
 * Converts payment error statuses to user-friendly title and subtitle
 * @param errorStatus - The error status from the API (e.g., "expired")
 * @param context - Extra values needed to build dynamic copy
 * @returns Object with title and subtitle for the error screen
 */
export function getPaymentErrorMessage(
  errorStatus?: string,
  context?: PaymentErrorContext,
): PaymentErrorMessage {
  if (errorStatus === AMOUNT_TOO_LOW && context?.minAmountCents) {
    const minAmount = formatFiatAmount(
      context.minAmountCents,
      context.currencyCode,
    );
    return {
      title: "Amount is too low",
      subtitle: `Payments must be at least ${minAmount} to cover network fees. Start a new payment with a higher amount.`,
    };
  }

  if (!errorStatus) {
    return DEFAULT_ERROR;
  }

  return ERROR_MESSAGES[errorStatus] || DEFAULT_ERROR;
}
