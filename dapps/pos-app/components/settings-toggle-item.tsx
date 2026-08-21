import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { Switch } from "./switch";
import { ThemedText } from "./themed-text";

interface SettingsToggleItemProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}

export function SettingsToggleItem({
  title,
  description,
  value,
  onValueChange,
  testID,
}: SettingsToggleItemProps) {
  const Theme = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: Theme["foreground-primary-fix"] },
      ]}
    >
      <View style={styles.labelRow}>
        <ThemedText
          fontSize={16}
          lineHeight={18}
          color="text-primary"
          style={styles.title}
        >
          {title}
        </ThemedText>
        {description && (
          <ThemedText
            fontSize={16}
            lineHeight={18}
            color="text-tertiary"
            numberOfLines={1}
            style={styles.description}
          >
            {description}
          </ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        style={styles.switch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["4"],
    gap: Spacing["spacing-2"],
  },
  labelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  title: {
    fontWeight: "500",
  },
  description: {
    flex: 1,
  },
  switch: {
    alignSelf: "center",
  },
});
