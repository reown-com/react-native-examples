import { Spacing } from "@/constants/spacing";
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
          type="accent"
          variant="primary"
          onPress={cta.onPress}
          style={styles.cta}
        >
          {cta.label}
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
  },
});
