import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { memo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  cta?: {
    label: string;
    onPress: () => void;
  };
}

function EmptyStateBase({ title, subtitle, icon, cta }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <ThemedText
        fontSize={20}
        lineHeight={24}
        color="text-primary"
        style={styles.title}
      >
        {title}
      </ThemedText>
      <ThemedText
        fontSize={16}
        lineHeight={20}
        color="text-secondary"
        style={styles.subtitle}
      >
        {subtitle}
      </ThemedText>
      {cta && (
        <Button
          onPress={cta.onPress}
          style={[styles.cta, { backgroundColor: theme["bg-accent-primary"] }]}
        >
          <ThemedText fontSize={16} lineHeight={18} color="text-invert">
            {cta.label}
          </ThemedText>
        </Button>
      )}
    </View>
  );
}

export const EmptyState = memo(EmptyStateBase);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-5"],
  },
  iconContainer: {
    marginBottom: Spacing["spacing-4"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing["spacing-2"],
  },
  subtitle: {
    textAlign: "center",
  },
  cta: {
    marginTop: Spacing["spacing-5"],
    paddingHorizontal: Spacing["spacing-6"],
    paddingVertical: Spacing["spacing-4"],
    borderRadius: BorderRadius["4"],
    alignItems: "center",
    justifyContent: "center",
  },
});
