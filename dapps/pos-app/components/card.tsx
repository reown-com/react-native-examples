import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "./pressable";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, style }: Props) {
  const Theme = useTheme();

  return onPress ? (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: Theme["foreground-primary-fix"] },
        style,
      ]}
    >
      {children}
    </Pressable>
  ) : (
    <View
      style={[
        styles.card,
        { backgroundColor: Theme["foreground-primary-fix"] },
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
