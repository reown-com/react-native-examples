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

// Format amount with decimals
export function formatAmount(
  value: string,
  decimals: number,
  minDecimals: number = 0,
): string {
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
}
