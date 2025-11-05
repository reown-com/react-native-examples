import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "./button";

interface CloseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  themeMode?: "light" | "dark";
}

export function CloseButton({ style, onPress, themeMode }: CloseButtonProps) {
  const { bottom } = useSafeAreaInsets();
  const Theme = useTheme(themeMode);
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
        source={require("@/assets/images/close.png")}
        cachePolicy="memory-disk"
        priority="high"
      />
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 4,
    borderRadius: BorderRadius["full"],
    height: 68,
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    bottom: Platform.OS === "ios" ? Spacing["spacing-2"] : Spacing["spacing-6"],
  },
  image: {
    width: 24,
    height: 24,
  },
});
