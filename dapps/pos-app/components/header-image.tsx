import { Spacing } from "@/constants/spacing";
import { Variants } from "@/constants/variants";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { View } from "react-native";

interface HeaderImageProps {
  tintColor?: string;
  padding?: boolean;
}

const BASE_LOGO = require("@/assets/images/brand.png");
const PLUS_LOGO = require("@/assets/images/plus.png");

const LOGO_HEIGHT = 18;

function getAspectRatio(source: number): number {
  const asset = Asset.fromModule(source);
  if (!asset?.width || !asset?.height) return 1;
  return asset.width / asset.height;
}

const BASE_ASPECT_RATIO = getAspectRatio(BASE_LOGO);
const PLUS_ASPECT_RATIO = getAspectRatio(PLUS_LOGO);

export default function HeaderImage({ tintColor, padding }: HeaderImageProps) {
  const variant = useSettingsStore((state) => state.variant);
  const variantLogo = Variants[variant].variantLogo;
  const variantAspectRatio = variantLogo
    ? getAspectRatio(variantLogo as number)
    : 1;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing["spacing-1"],
        marginTop: Spacing["spacing-1"],
        marginHorizontal: padding ? Spacing["spacing-2"] : 0,
      }}
    >
      <Image
        source={BASE_LOGO}
        cachePolicy="memory-disk"
        priority="high"
        contentFit="contain"
        tintColor={tintColor}
        style={{
          height: LOGO_HEIGHT,
          aspectRatio: BASE_ASPECT_RATIO,
          tintColor,
        }}
      />
      {variantLogo ? (
        <>
          <Image
            source={PLUS_LOGO}
            cachePolicy="memory-disk"
            priority="high"
            contentFit="contain"
            tintColor={tintColor}
            style={{
              height: LOGO_HEIGHT * 0.6,
              aspectRatio: PLUS_ASPECT_RATIO,
              tintColor,
            }}
          />
          <Image
            source={variantLogo}
            cachePolicy="memory-disk"
            priority="high"
            contentFit="contain"
            tintColor={tintColor}
            style={{
              height: LOGO_HEIGHT,
              aspectRatio: variantAspectRatio,
              tintColor,
            }}
          />
        </>
      ) : null}
    </View>
  );
}
