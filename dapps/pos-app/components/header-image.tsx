import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "react-native";

export default function HeaderImage() {
  const Theme = useTheme();
  return (
    <Image
      source={require("@/assets/images/brand.png")}
      resizeMode="contain"
      style={{
        height: 18,
        width: 165,
        marginTop: Spacing["spacing-1"],
        tintColor: Theme["text"],
      }}
    />
  );
}
