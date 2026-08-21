import { BorderRadius, Spacing } from "@/constants/spacing";
import { ColorKey } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface BadgeProps {
  label: string;
  backgroundColor: ColorKey;
  color: ColorKey;
  testID?: string;
}

export function Badge({ label, backgroundColor, color, testID }: BadgeProps) {
  const Theme = useTheme();

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: Theme[backgroundColor] }]}
    >
      <ThemedText
        fontSize={14}
        lineHeight={18}
        color={color}
        style={styles.label}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    height: 22,
    paddingHorizontal: Spacing["spacing-3"],
    borderRadius: BorderRadius["3"],
  },
  label: {
    fontWeight: "500",
  },
});
