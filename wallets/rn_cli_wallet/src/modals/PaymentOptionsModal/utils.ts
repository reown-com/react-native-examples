import Config from 'react-native-config';

export const arePayModalAnimationsEnabled = Config.ENV_TEST_MODE !== 'true';

// The Loading.json / Success.json artwork has inner padding inside its
// 1080×1080 canvas, so the visible glyph is smaller than the container.
export const LOTTIE_ICON_SIZE = 200;

// Shared icon area height for the LoadingView + ResultView screens. The fixed
// height keeps the Lottie centered at the same Y across the loading -> success
// transition, so the W and check don't jump. Text and any button below size
// naturally — the ViewWrapper's LinearTransition animates the modal growth.
export const PAY_STATUS_LAYOUT = {
  iconAreaHeight: 200,
} as const;

// Format date input as user types (YYYY-MM-DD)
export function formatDateInput(value: string): string {
  // Remove any non-numeric characters except dashes
  const cleaned = value.replace(/[^0-9]/g, '');

  // Format as YYYY-MM-DD
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(
      6,
      8,
    )}`;
  }
}

// Validate date format (YYYY-MM-DD) and check if it's a valid past date
export function isValidDateOfBirth(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();

  // Check if date is valid and in the past (and reasonable - not before 1900)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date < now &&
    year >= 1900
  );
}

// Validate required fields and return missing field names
export function validateRequiredFields(
  fields: { id: string; name: string; required?: boolean }[],
  data: Record<string, string>,
): string[] {
  return fields
    .filter(field => field.required && !data[field.id]?.trim())
    .map(field => field.name);
}

// Format amount with decimals
export function formatAmount(
  value: string,
  decimals: number,
  minDecimals: number = 0,
): string {
  const num = BigInt(value);
  const divisor = 10n ** BigInt(decimals);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;

  if (fractionalPart === BigInt(0)) {
    if (minDecimals > 0) {
      return `${integerPart}.${'0'.repeat(minDecimals)}`;
    }
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  // Remove trailing zeros, but keep at least minDecimals
  let trimmedFractional = fractionalStr.replace(/0+$/, '');
  if (trimmedFractional.length < minDecimals) {
    trimmedFractional = trimmedFractional.padEnd(minDecimals, '0');
  }
  return `${integerPart}.${trimmedFractional}`;
}

// ----- Currency Helpers -----

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  INR: '₹',
  RUB: '₽',
  BRL: 'R$',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  HKD: 'HK$',
  SGD: 'S$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  THB: '฿',
  MXN: '$',
  ZAR: 'R',
  TRY: '₺',
  ILS: '₪',
  PHP: '₱',
  MYR: 'RM',
  IDR: 'Rp',
  VND: '₫',
  CZK: 'Kč',
  HUF: 'Ft',
  AED: 'د.إ',
  SAR: '﷼',
  NZD: 'NZ$',
  TWD: 'NT$',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
};

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) {
    return '$';
  }
  return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
}

export type ErrorType =
  | 'insufficient_funds'
  | 'expired'
  | 'cancelled'
  | 'not_found'
  | 'generic';

export type ResultIcon = 'success' | 'coins' | 'warning';
export type ResultActionKind = 'close' | 'scanQR';

export interface ResultContent {
  title: string;
  // Errors show a secondary description line; success shows title only.
  description?: string;
  icon: ResultIcon;
  iconTestId: string;
  actionLabel: string;
  actionKind: ResultActionKind;
}

const SUCCESS_DEFAULT_TITLE = 'Payment confirmed';

export function detectErrorType(message: string): ErrorType {
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes('insufficient') ||
    lowerMsg.includes('balance') ||
    lowerMsg.includes('funds')
  ) {
    return 'insufficient_funds';
  }
  if (lowerMsg.includes('expired') || lowerMsg.includes('timeout')) {
    return 'expired';
  }
  if (lowerMsg.includes('cancelled') || lowerMsg.includes('canceled')) {
    return 'cancelled';
  }
  if (lowerMsg.includes('not found') || lowerMsg.includes('404')) {
    return 'not_found';
  }
  return 'generic';
}

function getErrorTitle(errorType: ErrorType): string {
  switch (errorType) {
    case 'insufficient_funds':
      return 'Not enough funds in your wallet';
    case 'expired':
      return 'Payment request expired';
    case 'cancelled':
      return 'Payment request cancelled';
    case 'not_found':
      return 'Payment request not found';
    case 'generic':
      return 'Payment didn’t go through';
  }
}

function getErrorDescription(
  errorType: ErrorType,
  originalMessage?: string,
): string {
  switch (errorType) {
    case 'insufficient_funds':
      return 'This wallet doesn’t have enough funds on the supported networks. Add funds, or pay with a different asset.';
    case 'expired':
      return 'Ask the merchant to create a new payment, then try again.';
    case 'cancelled':
      return 'Ask the merchant to create a new payment, then try again.';
    case 'not_found':
      return 'This payment link isn’t valid, or it’s already been completed.';
    case 'generic':
      return (
        originalMessage ||
        'No funds were moved. Try again, or pay with a different asset from checkout.'
      );
  }
}

function getErrorIcon(errorType: ErrorType): {
  icon: ResultIcon;
  testId: string;
} {
  switch (errorType) {
    case 'insufficient_funds':
      return { icon: 'coins', testId: 'pay-result-insufficient-funds-icon' };
    case 'expired':
      return { icon: 'warning', testId: 'pay-result-expired-icon' };
    case 'cancelled':
      return { icon: 'warning', testId: 'pay-result-cancelled-icon' };
    case 'not_found':
    case 'generic':
      return { icon: 'warning', testId: 'pay-result-error-icon' };
  }
}

function getErrorActionLabel(errorType: ErrorType): string {
  switch (errorType) {
    case 'insufficient_funds':
      return 'Got it';
    case 'expired':
    case 'cancelled':
      return 'Scan a new QR code';
    case 'not_found':
    case 'generic':
      return 'Close';
  }
}

/**
 * Resolves the full presentation for a result screen.
 *
 * @param status     'success' or 'error'.
 * @param errorType  The classified error (ignored for success).
 * @param ctx.message Dynamic context — the success summary on success, or the
 *                    raw error message used as the generic-error fallback.
 */
export function getResultContent(
  status: 'success' | 'error',
  errorType: ErrorType | null,
  ctx?: { message?: string },
): ResultContent {
  if (status === 'success') {
    return {
      title: ctx?.message || SUCCESS_DEFAULT_TITLE,
      icon: 'success',
      iconTestId: 'pay-result-success-icon',
      actionLabel: 'Done',
      actionKind: 'close',
    };
  }

  const type = errorType ?? 'generic';
  const { icon, testId } = getErrorIcon(type);

  return {
    title: getErrorTitle(type),
    description: getErrorDescription(type, ctx?.message),
    icon,
    iconTestId: testId,
    actionLabel: getErrorActionLabel(type),
    actionKind: type === 'expired' || type === 'cancelled' ? 'scanQR' : 'close',
  };
}

// Steps that render the LoadingView. Token setup happens during 'confirming'.
export type LoadingStep = 'loading' | 'confirming';

export interface LoadingContent {
  message: string;
  // Secondary line shown only while setting up a token for the first time.
  note?: string;
}

export function getLoadingContent(
  step: LoadingStep,
  ctx?: { setupTokenSymbol?: string | null },
): LoadingContent {
  const symbol = ctx?.setupTokenSymbol;
  if (symbol) {
    return {
      message: `Setting up ${symbol}`,
      note: `This usually takes a few seconds. Future ${symbol} payments will skip this step.`,
    };
  }

  return {
    message:
      step === 'confirming'
        ? 'Confirming your payment…'
        : 'Preparing your payment…',
  };
}
