export type CharacterType = "currency" | "digit" | "separator" | "decimal";

export type CharacterItem = {
  char: string;
  key: string;
  type: CharacterType;
  isPlaceholderDecimal?: boolean;
  isTertiaryCurrency?: boolean;
};

export type ParsedAmount = {
  characters: CharacterItem[];
  separators: (string | null)[];
};

type Options = {
  decimalSeparator?: string;
  actualDecimalDigits?: number;
  /** When true, all digits are placeholders (empty input state) */
  isFullPlaceholder?: boolean;
};

function getCharacterType(
  char: string,
  decimalSeparator: string,
): CharacterType {
  if (/\d/.test(char)) return "digit";
  if (char === decimalSeparator) return "decimal";
  if (
    char === "," ||
    char === "." ||
    char === " " ||
    char === "\u00A0" ||
    char === "\u202F"
  ) {
    return "separator";
  }
  return "currency";
}

/**
 * Parses formatted amount into characters and separators for animation.
 * Keys are indexed left-to-right so existing digits keep stable keys
 * and new digits (added on the right) get new keys with enter animation.
 */
export function getCharactersArray(
  formattedAmount: string,
  options: Options = {},
): ParsedAmount {
  const {
    decimalSeparator = ".",
    actualDecimalDigits,
    isFullPlaceholder = false,
  } = options;

  if (!formattedAmount) {
    return { characters: [], separators: [] };
  }

  const chars = formattedAmount.split("");
  const characters: CharacterItem[] = [];
  const separatorMap = new Map<number, string>();

  const decimalIndex = formattedAmount.indexOf(decimalSeparator);
  const hasDecimal = decimalIndex !== -1;

  let integerDigitIndex = 0;
  let decimalDigitIndex = 0;
  let charIndex = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const type = getCharacterType(char, decimalSeparator);

    if (type === "digit" || type === "currency") {
      let isPlaceholderDecimal = false;
      let key: string;

      if (type === "currency") {
        key = "currency";
      } else if (hasDecimal && i > decimalIndex) {
        // Decimal digits: index left-to-right from decimal point (d0, d1, d2...)
        decimalDigitIndex++;
        if (
          actualDecimalDigits !== undefined &&
          decimalDigitIndex > actualDecimalDigits
        ) {
          isPlaceholderDecimal = true;
        }
        const keyPrefix = isPlaceholderDecimal ? "placeholder-" : "";
        key = `${keyPrefix}d${decimalDigitIndex - 1}`;
      } else {
        // Integer digits: index left-to-right (i0, i1, i2...)
        // Existing digits keep their keys, new digits get new keys
        const keyPrefix = isFullPlaceholder ? "placeholder-" : "";
        key = `${keyPrefix}i${integerDigitIndex}`;
        integerDigitIndex++;
      }

      characters.push({
        char,
        key,
        type,
        isPlaceholderDecimal,
      });
      charIndex++;
    } else if (charIndex > 0) {
      separatorMap.set(charIndex - 1, char);
    }
  }

  // Right-positioned currency symbol should be tertiary when there are placeholder decimals
  const hasPlaceholderDecimals = characters.some((c) => c.isPlaceholderDecimal);
  const lastChar = characters[characters.length - 1];
  if (lastChar?.type === "currency" && hasPlaceholderDecimals) {
    lastChar.isTertiaryCurrency = true;
  }

  const separators: (string | null)[] = characters.map(
    (_, idx) => separatorMap.get(idx) ?? null,
  );

  return { characters, separators };
}
