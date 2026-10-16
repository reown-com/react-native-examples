import { ReceiptIcon } from "@/components/icons";
import { PaymentRow } from "@/components/payment-row";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useMerchantStore } from "@/store/useMerchantStore";
import {
  paymentsForMerchant,
  usePaymentsStore,
} from "@/store/usePaymentsStore";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ActivityScreen() {
  const Theme = useTheme();
  const activeAddress = useMerchantStore((s) => s.activeAddress);
  const allPayments = usePaymentsStore((s) => s.payments);
  const payments = useMemo(
    () => paymentsForMerchant(allPayments, activeAddress),
    [allPayments, activeAddress],
  );

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} title="Activity" />
      <ScrollView contentContainerStyle={styles.content}>
        {payments.length === 0 ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: Theme["foreground-secondary"] },
              ]}
            >
              <ReceiptIcon size={18} color={Theme["icon-default"]} />
            </View>
            <ThemedText weight="500" style={styles.emptyTitle}>
              No payments yet
            </ThemedText>
            <ThemedText color="text-secondary" style={styles.emptyBody}>
              Completed payments will appear here.
            </ThemedText>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-6"],
  },
  card: {
    borderRadius: BorderRadius["5"],
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing["spacing-5"],
  },
  empty: {
    alignItems: "center",
    borderRadius: BorderRadius["5"],
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing["spacing-8"],
    marginTop: Spacing["spacing-6"],
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius["3"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-3"],
  },
  emptyTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: 13,
  },
});
