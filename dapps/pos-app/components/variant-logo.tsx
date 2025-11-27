import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

interface VariantLogoProps {
  tintColor?: string;
  style?: StyleProp<ImageStyle>;
}

export function VariantLogo({ tintColor, style }: VariantLogoProps) {
  const Theme = useTheme();
  const showVariantLogo = useSettingsStore((state) => state.showVariantLogo);
  const [assets] = useAssets([require("@/assets/images/variant_logo.png")]);
  const _tintColor = tintColor ?? Theme["text-secondary"];

  return showVariantLogo ? (
    <Image
      source={assets?.[0]}
      style={[styles.logo, { tintColor: _tintColor }, style]}
      tintColor={_tintColor}
      contentFit="contain"
    />
  ) : null;
}

const styles = StyleSheet.create({
  logo: {
    marginTop: Spacing["spacing-2"],
    width: 150,
    height: 18,
  },
});
