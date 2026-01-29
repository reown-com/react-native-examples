import { useMemo } from "react";
import {
  formatRawValueToDisplay,
  getDecimalSeparator,
  getDeviceLocale,
  type SupportedLocale,
} from "../utils/formatAmount";
import { getCharactersArray } from "../utils/getCharactersArray";

type UseAnimatedNumberValueParams = {
  value: string;
  currency: string;
  locale?: SupportedLocale;
  placeholder: string;
};

export const useAnimatedNumberValue = ({
  value,
  currency,
  locale,
  placeholder,
}: UseAnimatedNumberValueParams) => {
  const effectiveLocale = locale ?? getDeviceLocale();
  const decimalSeparator = getDecimalSeparator(effectiveLocale);
  const isEmpty = !value;

  // Count user-entered decimal digits (e.g., "1.5" = 1, "1.50" = 2)
  // Used to distinguish real digits from auto-filled placeholder zeros
  const actualDecimalDigits = useMemo(() => {
    if (!value) return undefined;
    const decimalIndex = value.replace(",", ".").indexOf(".");
    return decimalIndex === -1 ? undefined : value.length - decimalIndex - 1;
  }, [value]);

  const formattedValue = useMemo(() => {
    if (isEmpty) return `${currency}${placeholder}`;
    return formatRawValueToDisplay(value, {
      currency,
      locale: effectiveLocale,
    });
  }, [value, currency, effectiveLocale, isEmpty, placeholder]);

  const { characters, separators } = useMemo(
    () =>
      getCharactersArray(formattedValue, {
        decimalSeparator,
        actualDecimalDigits: isEmpty ? undefined : actualDecimalDigits,
        isFullPlaceholder: isEmpty,
      }),
    [formattedValue, decimalSeparator, actualDecimalDigits, isEmpty],
  );

  return { characters, separators, isEmpty, decimalSeparator };
};
