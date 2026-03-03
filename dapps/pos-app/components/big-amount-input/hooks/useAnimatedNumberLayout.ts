import type { CharacterItem } from "../utils/getCharactersArray";
import { useMemo } from "react";

const ITEM_HEIGHT = 60;
const CURSOR_OFFSET = 0;
const CURRENCY_SPACE = 6;
const SPACING_FACTOR = 0.9;

// Widths calibrated for KH Teka font at 64px (scale 1.0)
// May need adjustment based on actual font metrics
const CHARACTER_WIDTHS: Record<string, number> = {
  0: 42,
  1: 28,
  2: 38,
  3: 38,
  4: 40,
  5: 38,
  6: 40,
  7: 36,
  8: 38,
  9: 38,
  ".": 12,
  ",": 12,
  " ": 14,
  "\u00A0": 10,
  "\u202F": 10,
  $: 38,
  "€": 44,
  "£": 42,
};
const DEFAULT_WIDTH = 40;

const getCharWidth = (char: string): number =>
  CHARACTER_WIDTHS[char] ?? DEFAULT_WIDTH;

type UseAnimatedNumberLayoutParams = {
  characters: CharacterItem[];
  separators: (string | null)[];
  isEmpty: boolean;
};

function getScaleForLength(length: number): number {
  if (length <= 6) return 1;
  if (length <= 9) return 0.85;
  if (length <= 12) return 0.7;
  return 0.6;
}

export type CharacterLayoutInfo = {
  position: number;
  width: number;
  visualWidth: number;
  spacingWidth: number;
};

export type AnimatedNumberLayout = {
  itemHeight: number;
  scale: number;
  totalContentWidth: number;
  cursorPosition: number;
  characterLayouts: CharacterLayoutInfo[];
  getCharWidth: (char: string) => number;
};

export const useAnimatedNumberLayout = ({
  characters,
  separators,
  isEmpty,
}: UseAnimatedNumberLayoutParams): AnimatedNumberLayout => {
  const scale = useMemo(
    () => getScaleForLength(characters.length),
    [characters.length],
  );

  const characterLayouts = useMemo(() => {
    const layouts: CharacterLayoutInfo[] = [];
    let pos = 0;

    characters.forEach((char, index) => {
      const isCurrency = char.type === "currency";
      const width = getCharWidth(char.char);
      const visualWidth = width * scale;
      const spacingWidth = visualWidth * SPACING_FACTOR;

      if (!isCurrency && index > 0) {
        if (index === 1) pos += CURRENCY_SPACE;
        const prevSep = separators[index - 1];
        if (prevSep) pos += getCharWidth(prevSep) * scale;
      }

      layouts.push({ position: pos, width, visualWidth, spacingWidth });
      pos += spacingWidth;
    });

    return layouts;
  }, [characters, separators, scale]);

  const totalContentWidth = useMemo(() => {
    if (characterLayouts.length === 0) return 0;
    const last = characterLayouts[characterLayouts.length - 1];
    return last.position + last.visualWidth;
  }, [characterLayouts]);

  const cursorPosition = useMemo(() => {
    if (characterLayouts.length === 0) return 0;

    const placeholderIdx = characters.findIndex((c) => c.isPlaceholderDecimal);
    const cursorIdx =
      placeholderIdx !== -1 ? placeholderIdx - 1 : characters.length - 1;
    const layout = characterLayouts[cursorIdx];
    if (!layout) return 0;

    const charRight = layout.position + layout.visualWidth;
    const sep = separators[cursorIdx];

    if (sep) return charRight + getCharWidth(sep) * scale + CURSOR_OFFSET;

    const nextChar = characters[cursorIdx + 1];
    if (nextChar?.isPlaceholderDecimal && characterLayouts[cursorIdx + 1]) {
      return (charRight + characterLayouts[cursorIdx + 1].position) / 2;
    }

    return charRight + CURSOR_OFFSET;
  }, [characters, characterLayouts, separators, scale]);

  return useMemo(
    () => ({
      itemHeight: ITEM_HEIGHT,
      scale,
      totalContentWidth,
      cursorPosition,
      characterLayouts,
      getCharWidth,
    }),
    [scale, totalContentWidth, cursorPosition, characterLayouts],
  );
};
