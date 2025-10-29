import { Spacing } from "@/constants/spacing";
import { Image } from "react-native";

interface HeaderImageProps {
  tintColor?: string;
}

export default function HeaderImage({ tintColor }: HeaderImageProps) {
  console.log("tintColor", tintColor);
  return (
    <Image
      source={require("@/assets/images/brand.png")}
      resizeMode="contain"
      style={{
        height: 18,
        width: 165,
        marginTop: Spacing["spacing-1"],
        tintColor: tintColor,
      }}
    />
  );
}
