import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { formatCentsWithSymbol } from "@/utils/currency";
import { PaymentRecord } from "@/utils/types";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

const STATUS_LABEL: Record<string, string> = {
  succeeded: "Completed",
  processing: "Processing",
  requires_action: "Pending",
  failed: "Failed",
  expired: "Expired",
  cancelled: "Cancelled",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString();
}

export function PaymentRow({ payment }: { payment: PaymentRecord }) {
  const Theme = useTheme();
  const isSuccess = payment.status === "succeeded";
  const color = isSuccess
    ? Theme["text-success"]
    : payment.status === "failed" ||
        payment.status === "expired" ||
        payment.status === "cancelled"
      ? Theme["text-error"]
      : Theme["text-secondary"];

  return (
    <View style={[styles.row, { borderBottomColor: Theme["border-primary"] }]}>
      <View>
        <ThemedText weight="500" style={styles.amount}>
          {formatCentsWithSymbol(payment.amountCents, payment.currency)}
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.meta}>
          {timeAgo(payment.createdAt)}
        </ThemedText>
      </View>
      <ThemedText weight="500" style={[styles.status, { color }]}>
        {STATUS_LABEL[payment.status] ?? payment.status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing["spacing-3"],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  amount: {
    fontSize: 15,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  status: {
    fontSize: 13,
  },
});
