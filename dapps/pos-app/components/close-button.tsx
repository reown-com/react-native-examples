import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button } from "./button";

interface CloseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  themeMode?: "light" | "dark";
}

export function CloseButton({ style, onPress, themeMode }: CloseButtonProps) {
  const Theme = useTheme(themeMode);
  const [assets] = useAssets([require("@/assets/images/close.png")]);

  return (
    <Button
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: Theme["foreground-primary"],
          borderColor: Theme["bg-primary"],
        },
        style,
      ]}
    >
      <Image
        style={[styles.image, { tintColor: Theme["text-primary"] }]}
        source={assets?.[0]}
        tintColor={Theme["text-primary"]}
        cachePolicy="memory-disk"
        priority="high"
      />
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius["full"],
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    bottom: Platform.OS === "web" ? 0 : Spacing["spacing-6"],
  },
  image: {
    width: 24,
    height: 24,
  },
});
