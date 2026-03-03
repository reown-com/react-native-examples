import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface ToastProps {
  message?: string;
  type: "error" | "info" | "success" | "warning";
}

export function Toast({ message = "", type }: ToastProps) {
  const Theme = useTheme();

  const image =
    type === "error"
      ? require("@/assets/images/error.png")
      : require("@/assets/images/check_circle.png");
  const iconColor =
    type === "error" ? Theme["icon-error"] : Theme["icon-success"];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme["foreground-primary"],
          borderColor: Theme["border-primary"],
        },
      ]}
    >
      <Image
        source={image}
        style={[styles.image, { tintColor: iconColor }]}
        tintColor={iconColor}
      />

      <ThemedText fontSize={16} lineHeight={18}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "90%",
    gap: Spacing["spacing-2"],
    padding: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    borderWidth: 1,
  },
  image: {
    height: 18,
    width: 18,
  },
});
