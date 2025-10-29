import { BorderRadius } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native";
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
        style={styles.image}
        source={require("@/assets/images/close.png")}
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
