import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { TransactionStatus } from "@/utils/types";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

type DisplayStatus = "completed" | "pending" | "failed";

interface StatusBadgeProps {
  status: TransactionStatus;
}

const STATUS_THEME_KEYS: Record<
  DisplayStatus,
  "icon-success" | "foreground-tertiary" | "icon-error"
> = {
  completed: "icon-success",
  pending: "foreground-tertiary",
  failed: "icon-error",
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

function mapToDisplayStatus(status: TransactionStatus): DisplayStatus {
  switch (status) {
    case "succeeded":
      return "completed";
    case "failed":
    case "expired":
      return "failed";
    case "requires_action":
    case "processing":
    default:
      return "pending";
  }
}

function StatusBadgeBase({ status }: StatusBadgeProps) {
  const theme = useTheme();
  const displayStatus = mapToDisplayStatus(status);
  const backgroundColor = theme[STATUS_THEME_KEYS[displayStatus]];
  const label = STATUS_LABELS[displayStatus];
  const textColor = displayStatus === "pending" ? "text-primary" : "text-white";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText fontSize={14} style={styles.text} color={textColor}>
        {label}
      </ThemedText>
    </View>
  );
}

export const StatusBadge = memo(StatusBadgeBase);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing["spacing-2"],
    paddingVertical: 6,
    borderRadius: BorderRadius["2"],
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "500",
  },
});
