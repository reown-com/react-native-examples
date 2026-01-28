import { Spacing } from "@/constants/spacing";
import { Variants } from "@/constants/variants";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Image } from "expo-image";

interface HeaderImageProps {
  tintColor?: string;
  padding?: boolean;
}

export default function HeaderImage({ tintColor, padding }: HeaderImageProps) {
  const variant = useSettingsStore((state) => state.variant);
  const brandLogo = Variants[variant].brandLogo as string;
  return (
    <Image
      source={brandLogo}
      cachePolicy="memory-disk"
      priority="high"
      contentFit="contain"
      tintColor={tintColor}
      style={{
        height: 18,
        width: Variants[variant].brandLogoWidth ?? 185,
        marginTop: Spacing["spacing-1"],
        tintColor: tintColor,
        marginHorizontal: padding ? Spacing["spacing-2"] : 0,
      }}
    />
  );
}
