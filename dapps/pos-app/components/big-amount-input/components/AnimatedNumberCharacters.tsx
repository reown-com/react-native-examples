import type { CharacterItem, CharacterType } from "../utils/getCharactersArray";
import { memo, useMemo } from "react";
import { AnimatedCharacter } from "./AnimatedCharacter";
import type {
  AnimatedNumberLayout,
  CharacterLayoutInfo,
} from "../hooks/useAnimatedNumberLayout";

type CharacterGroupProps = {
  item: CharacterItem;
  index: number;
  separator: string | null;
  decimalSeparator: string;
  layout: AnimatedNumberLayout;
  charLayout: CharacterLayoutInfo;
  isEmpty: boolean;
  textPrimaryColor: string;
  textSecondaryColor: string;
  textTertiaryColor: string;
};

function CharacterGroupComponent({
  item,
  index,
  separator,
  decimalSeparator,
  layout,
  charLayout,
  isEmpty,
  textPrimaryColor,
  textSecondaryColor,
  textTertiaryColor,
}: CharacterGroupProps) {
  const separatorItem = useMemo<CharacterItem | null>(() => {
    if (!separator) return null;
    const type: CharacterType =
      separator === decimalSeparator ? "decimal" : "separator";
    return { char: separator, key: `sep-${index}`, type };
  }, [separator, decimalSeparator, index]);

  return (
    <>
      <AnimatedCharacter
        item={item}
        scale={layout.scale}
        characterWidth={charLayout.width}
        itemHeight={layout.itemHeight}
        positionX={charLayout.position}
        isPlaceholder={isEmpty}
        textPrimaryColor={textPrimaryColor}
        textSecondaryColor={textSecondaryColor}
        textTertiaryColor={textTertiaryColor}
      />
      {separatorItem && separator ? (
        <AnimatedCharacter
          item={separatorItem}
          scale={layout.scale}
          characterWidth={layout.getCharWidth(separator)}
          itemHeight={layout.itemHeight}
          positionX={charLayout.position + charLayout.spacingWidth}
          isPlaceholder={isEmpty}
          textPrimaryColor={textPrimaryColor}
          textSecondaryColor={textSecondaryColor}
          textTertiaryColor={textTertiaryColor}
        />
      ) : null}
    </>
  );
}

const CharacterGroup = memo(CharacterGroupComponent);

type AnimatedNumberCharactersProps = {
  characters: CharacterItem[];
  separators: (string | null)[];
  isEmpty: boolean;
  decimalSeparator: string;
  layout: AnimatedNumberLayout;
  textPrimaryColor: string;
  textSecondaryColor: string;
  textTertiaryColor: string;
};

function AnimatedNumberCharactersComponent({
  characters,
  separators,
  isEmpty,
  decimalSeparator,
  layout,
  textPrimaryColor,
  textSecondaryColor,
  textTertiaryColor,
}: AnimatedNumberCharactersProps) {
  return (
    <>
      {characters.map((item, index) => (
        <CharacterGroup
          key={item.key}
          item={item}
          index={index}
          separator={separators[index]}
          decimalSeparator={decimalSeparator}
          layout={layout}
          charLayout={layout.characterLayouts[index]}
          isEmpty={isEmpty}
          textPrimaryColor={textPrimaryColor}
          textSecondaryColor={textSecondaryColor}
          textTertiaryColor={textTertiaryColor}
        />
      ))}
    </>
  );
}

export const AnimatedNumberCharacters = memo(AnimatedNumberCharactersComponent);
