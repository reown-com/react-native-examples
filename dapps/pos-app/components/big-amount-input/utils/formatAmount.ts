import type { SymbolPosition } from "@/utils/currency";

export type SupportedLocale = "en-US" | "fr-FR" | "de-DE" | "nl-NL";

export type { SymbolPosition };

export type FormatAmountOptions = {
  currency?: string;
  locale?: SupportedLocale;
  symbolPosition?: SymbolPosition;
};

const DEFAULT_LOCALE: SupportedLocale = "en-US";

export function getDecimalSeparator(
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const numberWithDecimal = 1.1;
  const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal);
  return formatted.charAt(1);
}

export function getDefaultLocale(): SupportedLocale {
  return DEFAULT_LOCALE;
}

export function parseRawValue(rawValue: string): number {
  if (!rawValue || rawValue === "") return 0;
  const normalized = rawValue.replace(",", ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats raw value (e.g., "123.45") to display string with currency.
 * When decimal separator is entered, always shows 2 decimal places
 * so placeholder zeros can be styled differently.
 */
export function formatRawValueToDisplay(
  rawValue: string,
  options: FormatAmountOptions = {},
): string {
  const {
    currency = "$",
    locale = DEFAULT_LOCALE,
    symbolPosition = "left",
  } = options;

  if (!rawValue || rawValue === "") return "";

  const hasDecimalSeparator = rawValue.includes(".") || rawValue.includes(",");
  const numericValue = parseRawValue(rawValue);

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: hasDecimalSeparator ? 2 : 0,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(numericValue);
  return symbolPosition === "right"
    ? `${formatted}${currency}`
    : `${currency}${formatted}`;
}

/**
 * Cleans input: allows digits, one decimal separator, max 2 decimal places.
 */
export function formatAmountInput(
  value: string,
  decimalSeparator: "." | "," = ".",
): string {
  if (!value) return "";

  const altSeparator = decimalSeparator === "." ? "," : ".";
  let cleaned = value.replace(altSeparator, decimalSeparator);

  const sepRegex = `\\${decimalSeparator}`;
  cleaned = cleaned.replace(new RegExp(`[^0-9${sepRegex}]`, "g"), "");

  const sepIndex = cleaned.indexOf(decimalSeparator);
  if (sepIndex === -1) return cleaned;

  const integerPart = cleaned.slice(0, sepIndex);
  const decimalPart = cleaned
    .slice(sepIndex + 1)
    .replace(new RegExp(sepRegex, "g"), "")
    .slice(0, 2);

  return `${integerPart}${decimalSeparator}${decimalPart}`;
}
