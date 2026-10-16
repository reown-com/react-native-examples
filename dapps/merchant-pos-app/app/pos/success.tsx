import { PlusIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { WalletChip } from "@/components/wallet-chip";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useMerchantStore } from "@/store/useMerchantStore";
import { formatCentsWithSymbol } from "@/utils/currency";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function SuccessScreen() {
  const Theme = useTheme();
  const params = useLocalSearchParams<{
    amountCents: string;
    currency: string;
  }>();
  const amountCents = Number(params.amountCents ?? 0);
  const currency = params.currency ?? "USD";
  const merchant = useMerchantStore((s) => s.getActiveMerchant());

  return (
    <Screen>
      <View style={styles.content}>
        <View
          style={[styles.icon, { backgroundColor: Theme["surface-success"] }]}
        >
          <Svg width={44} height={44} viewBox="0 0 40 40" fill="none">
            <Circle cx={20} cy={20} r={20} fill={`${Theme["success"]}26`} />
            <Path
              d="M12 20l6 6 10-12"
              stroke={Theme["success"]}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <ThemedText weight="500" style={styles.title}>
          Payment received!
        </ThemedText>
        <ThemedText
          weight="500"
          style={[styles.amount, { color: Theme["success"] }]}
        >
          {formatCentsWithSymbol(amountCents, currency)}
        </ThemedText>

        {merchant ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <View
              style={[
                styles.row,
                { borderBottomColor: Theme["border-primary"] },
              ]}
            >
              <ThemedText color="text-secondary" style={styles.rowLabel}>
                Settled to
              </ThemedText>
              <WalletChip address={merchant.address} bare />
            </View>
            <View style={styles.row}>
              <ThemedText color="text-secondary" style={styles.rowLabel}>
                Status
              </ThemedText>
              <ThemedText weight="500" style={{ color: Theme["success"] }}>
                Confirmed
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="New payment"
          onPress={() => router.replace("/pos/amount")}
          icon={<PlusIcon size={18} color="#fff" />}
        />
        <PrimaryButton
          label="Back to home"
          variant="secondary"
          onPress={() => router.replace("/home")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-6"],
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-5"],
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing["spacing-2"],
  },
  amount: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: Spacing["spacing-7"],
  },
  card: {
    width: "100%",
    borderRadius: BorderRadius["5"],
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing["spacing-5"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing["spacing-3"],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingBottom: Spacing["spacing-4"],
    gap: Spacing["spacing-3"],
  },
});
