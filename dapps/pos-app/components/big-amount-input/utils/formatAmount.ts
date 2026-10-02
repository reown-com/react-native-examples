import type { SymbolPosition } from "@/utils/currency";

export type SupportedLocale = "en-US" | "fr-FR" | "de-DE" | "nl-NL";

export type { SymbolPosition };

export type FormatAmountOptions = {
  currency?: string;
  locale?: SupportedLocale;
  symbolPosition?: SymbolPosition;
};

const DEFAULT_LOCALE: SupportedLocale = "en-US";

// Separators are fixed per locale, and constructing Intl.NumberFormat is slow on
// Android Hermes (ICU locale resolution over JNI), so resolve each locale once
// instead of on every keypress.
const decimalSeparators = new Map<SupportedLocale, string>();
const groupSeparators = new Map<SupportedLocale, string>();

export function getDecimalSeparator(
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  let separator = decimalSeparators.get(locale);
  if (separator === undefined) {
    const numberWithDecimal = 1.1;
    const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal);
    separator = formatted.charAt(1);
    decimalSeparators.set(locale, separator);
  }
  return separator;
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

function getGroupSeparator(locale: SupportedLocale): string {
  let separator = groupSeparators.get(locale);
  if (separator === undefined) {
    // Avoid formatToParts — not supported in Hermes
    const formatted = new Intl.NumberFormat(locale).format(10000);
    // Strip all digits — what remains is the group separator (e.g. "," or ".")
    separator = formatted.replace(/\d/g, "").charAt(0) || ",";
    groupSeparators.set(locale, separator);
  }
  return separator;
}

function addThousandsSeparators(integerStr: string, separator: string): string {
  let result = "";
  for (let i = integerStr.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      result = separator + result;
    }
    result = integerStr[i] + result;
  }
  return result;
}

/**
 * Formats raw value (e.g., "123.45") to display string with currency.
 * When decimal separator is entered, always shows 2 decimal places
 * so placeholder zeros can be styled differently.
 * Uses string manipulation instead of parseFloat to avoid precision loss
 * with large numbers (> Number.MAX_SAFE_INTEGER).
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
  const normalized = rawValue.replace(",", ".");
  const [intPart, decPart] = normalized.split(".");
  const cleanInteger = (intPart || "0").replace(/^0+/, "") || "0";

  const groupSep = getGroupSeparator(locale);
  const decSep = getDecimalSeparator(locale);
  const formattedInteger = addThousandsSeparators(cleanInteger, groupSep);

  let formatted: string;
  if (hasDecimalSeparator) {
    const paddedDecimal = (decPart || "").padEnd(2, "0").slice(0, 2);
    formatted = `${formattedInteger}${decSep}${paddedDecimal}`;
  } else {
    formatted = formattedInteger;
  }

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
