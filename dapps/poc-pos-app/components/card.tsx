import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Button } from "./button";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, style }: Props) {
  const Theme = useTheme();

  return onPress ? (
    <Button
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: Theme["foreground-primary"] },
        style,
      ]}
    >
      {children}
    </Button>
  ) : (
    <View
      style={[
        styles.card,
        { backgroundColor: Theme["foreground-primary"] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing["spacing-7"],
    borderRadius: BorderRadius["5"],
  },
});
