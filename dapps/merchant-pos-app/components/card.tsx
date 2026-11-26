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
  const cardStyle = [
    styles.card,
    {
      backgroundColor: Theme["foreground-primary"],
      borderColor: Theme["border-primary"],
    },
    style,
  ];

  return onPress ? (
    <Button onPress={onPress} style={cardStyle}>
      {children}
    </Button>
  ) : (
    <View style={cardStyle}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing["spacing-5"],
    borderRadius: BorderRadius["5"],
    borderWidth: StyleSheet.hairlineWidth,
  },
});
