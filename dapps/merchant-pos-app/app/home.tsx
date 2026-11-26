import { ActionCard } from "@/components/action-card";
import {
  DisconnectIcon,
  LinkIcon,
  PlusIcon,
  ReceiptIcon,
  WcLogo,
} from "@/components/icons";
import { MerchantCard } from "@/components/merchant-card";
import { PaymentRow } from "@/components/payment-row";
import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { StatBox } from "@/components/stat-box";
import { ThemedText } from "@/components/themed-text";
import { Brand } from "@/constants/theme";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useReconcilePaymentLinks } from "@/hooks/use-reconcile-payment-links";
import { useTheme } from "@/hooks/use-theme-color";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  countToday,
  paymentsForMerchant,
  usePaymentsStore,
  volumeTodayCents,
} from "@/store/usePaymentsStore";
import { formatCentsWithSymbol } from "@/utils/currency";
import { nukeAllStorage } from "@/utils/dev-reset";
import { showToast } from "@/utils/toast";
import { getConnectedAddresses } from "@/utils/wallet-accounts";
import { useAppKit } from "@reown/appkit-react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const Theme = useTheme();
  const { disconnect } = useAppKit();
  // Fold any newly-paid payment links into the payments store so they show up
  // in the stats + recent activity below.
  useReconcilePaymentLinks();
  const merchant = useMerchantStore((s) => s.getActiveMerchant());
  const activeAddress = useMerchantStore((s) => s.activeAddress);
  const clearActive = useMerchantStore((s) => s.clearActive);
  const upsertMerchant = useMerchantStore((s) => s.upsertMerchant);
  const currency = useSettingsStore((s) => s.currency);
  const allPayments = usePaymentsStore((s) => s.payments);
  const payments = useMemo(
    () => paymentsForMerchant(allPayments, activeAddress),
    [allPayments, activeAddress],
  );

  // Guard: if there's no active merchant, return to Welcome.
  useEffect(() => {
    if (!merchant) router.replace("/");
  }, [merchant]);

  // Self-heal: backfill any settlement address that wasn't captured at
  // onboarding (e.g. the Solana address) from the live wallet connection.
  // Runs once per active merchant — reading via getState() avoids depending on
  // the merchant object reference, which would re-trigger on every upsert.
  const healedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeAddress || healedRef.current === activeAddress) return;
    const m = useMerchantStore.getState().getActiveMerchant();
    if (!m) return;
    const live = getConnectedAddresses();
    const current = m.addresses ?? { [m.namespace]: m.address };
    const merged = { ...current };
    let changed = false;
    for (const ns of m.networks) {
      if (!merged[ns] && live[ns]) {
        merged[ns] = live[ns];
        changed = true;
      }
    }
    if (changed) {
      upsertMerchant({ ...m, addresses: merged });
      healedRef.current = activeAddress;
    }
  }, [activeAddress, upsertMerchant]);

  if (!merchant) return <Screen />;

  const recent = payments.slice(0, 4);

  const onDisconnect = async () => {
    await disconnect();
    clearActive();
    showToast("Wallet disconnected");
    router.replace("/");
  };

  const onDevReset = async () => {
    try {
      await disconnect();
    } catch {
      // ignore
    }
    await nukeAllStorage();
    showToast("Storage cleared");
    router.replace("/");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <WcLogo size={30} radius={9} />
          <View style={styles.topActions}>
            <Pressable
              onPress={() => router.push("/activity")}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: Theme["foreground-primary"],
                  borderColor: Theme["border-primary"],
                },
              ]}
            >
              <ReceiptIcon size={18} color={Theme["icon-default"]} />
            </Pressable>
          </View>
        </View>

        <MerchantCard merchant={merchant} />

        <View style={styles.stats}>
          <StatBox
            value={formatCentsWithSymbol(volumeTodayCents(payments), currency)}
            label="Volume today"
          />
          <StatBox value={`${countToday(payments)}`} label="Payments" />
        </View>

        <View style={styles.actions}>
          <ActionCard
            title="New payment"
            subtitle="POS · QR · deep link"
            highlight
            iconBg="rgba(59,153,252,0.15)"
            icon={<PlusIcon size={20} color={Brand.ethereum} />}
            onPress={() => router.push("/pos/amount")}
          />
          <ActionCard
            title="Payment links"
            subtitle="Share & manage"
            iconBg="rgba(124,58,237,0.15)"
            icon={<LinkIcon size={20} color="#7c3aed" />}
            onPress={() => router.push("/links")}
          />
        </View>

        <View style={styles.sectionHead}>
          <ThemedText weight="500" style={styles.sectionTitle}>
            Recent activity
          </ThemedText>
          {recent.length > 0 ? (
            <Pressable onPress={() => router.push("/activity")}>
              <ThemedText color="text-accent-primary" style={styles.seeAll}>
                See all
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        {recent.length === 0 ? (
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
              Tap &quot;New payment&quot; to get started.
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
            {recent.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </View>
        )}

        <PrimaryButton
          label="Disconnect wallet"
          variant="danger"
          onPress={onDisconnect}
          icon={<DisconnectIcon size={15} color={Theme["text-error"]} />}
          style={styles.disconnect}
        />
        {__DEV__ && (
          <PrimaryButton
            label="Reset storage (dev)"
            variant="ghost"
            onPress={onDevReset}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-8"],
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing["spacing-4"],
  },
  topActions: {
    flexDirection: "row",
    gap: Spacing["spacing-2"],
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius["3"],
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flexDirection: "row",
    gap: Spacing["spacing-3"],
    marginTop: Spacing["spacing-4"],
    marginBottom: Spacing["spacing-5"],
  },
  actions: {
    flexDirection: "row",
    gap: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-6"],
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing["spacing-3"],
  },
  sectionTitle: {
    fontSize: 15,
  },
  seeAll: {
    fontSize: 13,
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
    paddingVertical: Spacing["spacing-7"],
    paddingHorizontal: Spacing["spacing-4"],
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
  disconnect: {
    marginTop: Spacing["spacing-6"],
    height: 46,
  },
});
