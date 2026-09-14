import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

interface TestModePillProps {
  style?: StyleProp<ViewStyle>;
}

export function TestModePill({ style }: TestModePillProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme["foreground-accent-primary-60"] },
        style,
      ]}
    >
      <ThemedText
        fontSize={14}
        lineHeight={18}
        style={{
          color: theme["text-primary"],
          fontFamily: "KH Teka Medium",
          fontWeight: "500",
        }}
      >
        Test mode
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-3"],
    paddingVertical: Spacing["spacing-1"],
    borderRadius: 999,
  },
});
