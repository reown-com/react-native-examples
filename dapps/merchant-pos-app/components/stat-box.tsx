import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

export function StatBox({ value, label }: { value: string; label: string }) {
  const Theme = useTheme();
  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: Theme["foreground-primary"],
          borderColor: Theme["border-primary"],
        },
      ]}
    >
      <ThemedText weight="500" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText color="text-secondary" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: BorderRadius["4"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-4"],
    alignItems: "center",
  },
  value: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});
