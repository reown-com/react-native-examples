import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { formatFiatAmount } from "@/utils/currency";
import { formatShortDate } from "@/utils/misc";
import { PaymentRecord } from "@/utils/types";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "./button";
import { StatusBadge } from "./status-badge";
import { ThemedText } from "./themed-text";

interface TransactionCardProps {
  payment: PaymentRecord;
  onPress: () => void;
}

function TransactionCardBase({ payment, onPress }: TransactionCardProps) {
  const theme = useTheme();

  return (
    <Button
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme["foreground-primary"] },
      ]}
    >
      <View style={styles.leftContent}>
        <ThemedText fontSize={16} lineHeight={20} color="text-primary">
          {formatFiatAmount(payment.fiat_amount, payment.fiat_currency)}
        </ThemedText>
        <ThemedText
          fontSize={14}
          lineHeight={18}
          color="text-secondary"
          style={styles.date}
        >
          {formatShortDate(payment.created_at)}
        </ThemedText>
      </View>
      <StatusBadge status={payment.status} />
    </Button>
  );
}

export const TransactionCard = memo(TransactionCardBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing["spacing-6"],
    borderRadius: BorderRadius["3"],
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  date: {
    marginLeft: Spacing["spacing-1"],
  },
});
