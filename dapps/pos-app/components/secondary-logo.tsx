import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { isVariant } from "@/utils/misc";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

interface SecondaryLogoProps {
  tintColor?: string;
  style?: StyleProp<ImageStyle>;
}

export function SecondaryLogo({ tintColor, style }: SecondaryLogoProps) {
  const Theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/polygon_logo.png")]);
  const showLogo = isVariant();
  const _tintColor = tintColor ?? Theme["text-secondary"];

  return showLogo ? (
    <Image
      source={assets?.[0]}
      style={[styles.logo, style]}
      tintColor={_tintColor}
    />
  ) : null;
}

const styles = StyleSheet.create({
  logo: {
    marginTop: Spacing["spacing-2"],
    width: 92,
    height: 18,
  },
});
