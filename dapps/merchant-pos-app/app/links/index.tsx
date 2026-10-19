import { CreateLinkSheet } from "@/components/create-link-sheet";
import { PlusIcon, ShareIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useReconcilePaymentLinks } from "@/hooks/use-reconcile-payment-links";
import { useTheme } from "@/hooks/use-theme-color";
import { useStartPayment } from "@/services/hooks";
import { useMerchantStore } from "@/store/useMerchantStore";
import {
  isLinkActive,
  linksForMerchant,
  usePaymentLinksStore,
} from "@/store/usePaymentLinksStore";
import { PAYMENT_LINK_VALIDITY_MS } from "@/store/usePaymentsStore";
import {
  CurrencyCode,
  formatCentsWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { generateReferenceId } from "@/utils/id";
import { sharePaymentLink } from "@/utils/share";
import { showErrorToast, showToast } from "@/utils/toast";
import { PaymentLink } from "@/utils/types";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

export default function LinksScreen() {
  const Theme = useTheme();
  // Detect link payments so rows flip to "Paid" and the payment lands in stats.
  useReconcilePaymentLinks();
  const activeAddress = useMerchantStore((s) => s.activeAddress);
  const allLinks = usePaymentLinksStore((s) => s.links);
  const links = useMemo(
    () => linksForMerchant(allLinks, activeAddress),
    [allLinks, activeAddress],
  );
  const addLink = usePaymentLinksStore((s) => s.addLink);
  const startPayment = useStartPayment();
  const [sheetOpen, setSheetOpen] = useState(false);

  const onCreate = async (input: {
    label?: string;
    amountCents: number;
    currency: CurrencyCode;
  }) => {
    try {
      const now = Date.now();
      // Mint a payment that stays payable for 10 days (vs the ~15-min POS default).
      const expiresAtSec = Math.floor((now + PAYMENT_LINK_VALIDITY_MS) / 1000);
      const res = await startPayment.mutateAsync({
        referenceId: generateReferenceId(),
        amount: {
          value: String(input.amountCents),
          unit: getCurrency(input.currency).unit,
        },
        expiresAt: expiresAtSec,
      });
      // Prefer the server's echoed expiry; fall back to our 10-day window.
      const expiresAt = res.expiresAt
        ? res.expiresAt * 1000
        : now + PAYMENT_LINK_VALIDITY_MS;
      addLink({
        id: uuidv4(),
        merchantAddress: activeAddress ?? "",
        paymentId: res.paymentId,
        label: input.label,
        amountCents: input.amountCents,
        currency: input.currency,
        gatewayUrl: res.gatewayUrl,
        createdAt: now,
        expiresAt,
      });
      setSheetOpen(false);
      showToast("Payment link created");
      // Pop the native share sheet so the merchant can send it right away.
      await sharePaymentLink(res.gatewayUrl, input.label);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create link";
      showErrorToast(message);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        onBack={() => router.back()}
        title="Payment links"
        right={
          <Pressable onPress={() => setSheetOpen(true)} hitSlop={8}>
            <PlusIcon size={20} color={Theme["icon-accent-primary"]} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {links.length === 0 ? (
          <ThemedText color="text-secondary" style={styles.empty}>
            No payment links yet. Create one to share a reusable payment
            request.
          </ThemedText>
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
            {links.map((link) => (
              <LinkRow key={link.id} link={link} />
            ))}
          </View>
        )}

        <PrimaryButton
          label="Create new payment link"
          variant="secondary"
          onPress={() => setSheetOpen(true)}
          icon={<PlusIcon size={16} color={Theme["text-primary"]} />}
          style={styles.createBtn}
        />
      </ScrollView>

      <CreateLinkSheet
        visible={sheetOpen}
        loading={startPayment.isPending}
        onClose={() => setSheetOpen(false)}
        onCreate={onCreate}
      />
    </Screen>
  );
}

function LinkRow({ link }: { link: PaymentLink }) {
  const Theme = useTheme();
  const paid = link.status === "succeeded";
  const active = !paid && isLinkActive(link);
  const pillLabel = paid ? "Paid" : active ? "Active" : "Expired";

  return (
    <View style={[styles.row, { borderBottomColor: Theme["border-primary"] }]}>
      <View style={styles.flex}>
        <ThemedText weight="500" style={styles.linkTitle} numberOfLines={1}>
          {link.label ?? "Payment link"}
        </ThemedText>
        <ThemedText
          color="text-secondary"
          style={styles.linkMeta}
          numberOfLines={1}
        >
          {formatCentsWithSymbol(link.amountCents, link.currency)} ·{" "}
          {link.gatewayUrl}
        </ThemedText>
      </View>
      <View style={styles.rowRight}>
        <View
          style={[
            styles.pill,
            {
              backgroundColor:
                paid || active
                  ? Theme["surface-success"]
                  : Theme["foreground-tertiary"],
            },
          ]}
        >
          <ThemedText
            weight="500"
            style={[
              styles.pillText,
              {
                color:
                  paid || active
                    ? Theme["text-success"]
                    : Theme["text-secondary"],
              },
            ]}
          >
            {pillLabel}
          </ThemedText>
        </View>
        {active ? (
          <Pressable
            onPress={() => sharePaymentLink(link.gatewayUrl, link.label)}
            hitSlop={8}
          >
            <ShareIcon size={18} color={Theme["icon-accent-primary"]} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-6"],
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing["spacing-8"],
    marginBottom: Spacing["spacing-6"],
  },
  card: {
    borderRadius: BorderRadius["5"],
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing["spacing-5"],
    marginBottom: Spacing["spacing-4"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing["spacing-3"],
    paddingVertical: Spacing["spacing-3"],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  flex: { flex: 1 },
  linkTitle: {
    fontSize: 14,
    marginBottom: 3,
  },
  linkMeta: {
    fontSize: 12,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  pill: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  pillText: {
    fontSize: 11,
  },
  createBtn: {
    marginTop: Spacing["spacing-2"],
  },
});
