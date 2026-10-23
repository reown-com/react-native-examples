import { formatFiatAmount } from "./currency";

interface PaymentErrorMessage {
  title: string;
  subtitle: string;
}

const DEFAULT_ERROR: PaymentErrorMessage = {
  title: "This payment didn't go through",
  subtitle:
    "No funds were moved. Check the terminal's connection before trying again.",
};

const ERROR_MESSAGES: Record<string, PaymentErrorMessage> = {
  expired: {
    title: "This payment expired",
    subtitle: "No funds were moved. Start a new payment.",
  },
  cancelled: {
    title: "Payment cancelled",
    subtitle: "No funds were moved.",
  },
  invalid_api_key: {
    title: "Incorrect API key",
    subtitle:
      "No funds were moved. Check that the merchant ID and customer API key are correct.",
  },
  params_validation: {
    title: "This payment didn't go through",
    subtitle:
      "No funds were moved. Try the payment again. If it keeps failing, contact support.",
  },
};

/** Synthetic code: the API reports this as a generic `params_validation`. */
export const AMOUNT_TOO_LOW = "amount_too_low";

/** API error code: the terminal's API key is invalid or has lost access. */
export const INVALID_API_KEY = "invalid_api_key";

/**
 * Whether an API or bridge error means the credentials were rejected: the
 * `invalid_api_key` code, or a bare 401 from a gateway that didn't send one.
 */
export function isInvalidApiKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { code, status } = error as { code?: unknown; status?: unknown };
  return code === INVALID_API_KEY || status === 401;
}

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
      title: "This amount is too low",
      subtitle: `Payments must be at least ${minAmount} to cover network fees.`,
    };
  }

  if (!errorStatus) {
    return DEFAULT_ERROR;
  }

  return ERROR_MESSAGES[errorStatus] || DEFAULT_ERROR;
}
