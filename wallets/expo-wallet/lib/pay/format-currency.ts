/**
 * Currency formatting utilities for WalletConnect Pay
 */

import type { PayAmount } from '@walletconnect/pay';

/**
 * Format a fiat amount (ISO 4217 currency)
 */
export function formatCurrency(
  amount: string | number,
  currency: string,
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));
}

/**
 * Format a PayAmount from the SDK.
 * Handles both fiat (iso4217/) and crypto (caip19/) amounts.
 *
 * @param payAmount - PayAmount object from the SDK
 * @returns Formatted string like "$329.00" or "32,900 USDC"
 */
export function formatPayAmount(payAmount: PayAmount): string {
  const { unit, value, display } = payAmount;

  // Parse the value using decimals from display
  const numericValue = formatAmountWithDecimals(value, display.decimals);

  // Check if it's a fiat currency (ISO 4217)
  if (unit.startsWith('iso4217/')) {
    const currencyCode = unit.replace('iso4217/', '');
    return formatCurrency(numericValue, currencyCode);
  }

  // Crypto amount - format with symbol
  const formattedNumber = Number(numericValue).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: display.decimals > 6 ? 6 : display.decimals,
  });

  return `${formattedNumber} ${display.assetSymbol}`;
}

/**
 * Format an amount value with decimals.
 * Converts from minor units to decimal representation.
 *
 * @param value - Amount in minor units (as string)
 * @param decimals - Number of decimal places
 * @param minDecimals - Minimum decimal places to show (default: 0)
 * @returns Decimal string representation
 */
export function formatAmountWithDecimals(
  value: string,
  decimals: number,
  minDecimals: number = 0,
): string {
  if (decimals === 0) {
    return value;
  }

  try {
    const num = BigInt(value);
    const divisor = BigInt(10 ** decimals);
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
  } catch {
    // Fallback for non-BigInt compatible values
    return (Number(value) / 10 ** decimals).toString();
  }
}

/**
 * Get a display-friendly amount from PayAmount.
 * Returns just the numeric part formatted for display.
 */
export function getDisplayAmount(payAmount: PayAmount): string {
  const numericValue = formatAmountWithDecimals(
    payAmount.value,
    payAmount.display.decimals,
  );
  return Number(numericValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits:
      payAmount.display.decimals > 6 ? 6 : payAmount.display.decimals,
  });
}
