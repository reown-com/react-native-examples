import { Spacing } from "@/constants/spacing";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText
        fontSize={18}
        lineHeight={20}
        color="text-tertiary"
        style={styles.title}
      >
        {title}
      </ThemedText>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing["spacing-3"],
  },
  title: {
    fontWeight: "500",
  },
  rows: {
    gap: Spacing["spacing-2"],
  },
});
