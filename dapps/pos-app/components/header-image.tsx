import { Spacing } from "@/constants/spacing";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";

interface HeaderImageProps {
  tintColor?: string;
  padding?: boolean;
}

export default function HeaderImage({ tintColor, padding }: HeaderImageProps) {
  const [assets] = useAssets([require("@/assets/images/brand.png")]);
  return (
    <Image
      source={assets?.[0]}
      cachePolicy="memory-disk"
      priority="high"
      style={{
        height: 18,
        width: 165,
        marginTop: Spacing["spacing-1"],
        tintColor: tintColor,
        paddingRight: padding ? Spacing["spacing-2"] : 0,
      }}
    />
  );
}
