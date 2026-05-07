import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

interface CloseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  themeMode?: "light" | "dark";
}

export function CloseButton({ style, onPress, themeMode }: CloseButtonProps) {
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
      <ThemedText>Cancel</ThemedText>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: BorderRadius["5"],
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    bottom: Platform.OS === "web" ? 0 : Spacing["spacing-6"],
  },
  image: {
    width: 24,
    height: 24,
  },
});
