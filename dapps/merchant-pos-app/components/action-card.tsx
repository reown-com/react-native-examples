import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

interface Props {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  highlight?: boolean;
  onPress: () => void;
}

/** Large tappable action tile on Home (New payment / Payment links). */
export function ActionCard({
  title,
  subtitle,
  icon,
  iconBg,
  highlight,
  onPress,
}: Props) {
  const Theme = useTheme();
  return (
    <Button
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: highlight
            ? Theme["surface-accent"]
            : Theme["foreground-primary"],
          borderColor: highlight
            ? Theme["border-accent-primary"]
            : Theme["border-primary"],
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: iconBg }]}>{icon}</View>
      <View>
        <ThemedText weight="500" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius["7"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-5"],
    gap: Spacing["spacing-3"],
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius["3"],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
});
