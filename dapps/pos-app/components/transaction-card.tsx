import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
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

/**
 * Format fiat amount from cents to display string
 */
function formatAmount(amount?: number, currency?: string): string {
  if (amount === undefined) return "-";

  const value = amount / 100;
  const currencyCode = extractCurrencyCode(currency);

  // Get currency symbol
  const symbol = currencyCode === "EUR" ? "\u20AC" : "$";

  return `${value.toFixed(2)}${symbol}`;
}

/**
 * Extract currency code from CAIP format (e.g., "iso4217/USD" -> "USD")
 */
function extractCurrencyCode(currency?: string): string {
  if (!currency) return "USD";
  return currency.includes("/") ? currency.split("/")[1] : currency;
}

/**
 * Format date to display string (e.g., "Oct 14, 25")
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
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
          {formatAmount(payment.fiat_amount, payment.fiat_currency)}
        </ThemedText>
        <ThemedText
          fontSize={14}
          lineHeight={18}
          color="text-secondary"
          style={styles.date}
        >
          {formatDate(payment.created_at)}
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
