import { BorderRadius } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Button } from "./button";

interface CloseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CloseButton({ style, onPress }: CloseButtonProps) {
  const Theme = useTheme();
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
  },
  image: {
    width: 24,
    height: 24,
  },
});
