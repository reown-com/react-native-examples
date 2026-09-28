import { getNetwork, NetworkId } from "@/constants/networks";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { MerchantConfig } from "@/utils/types";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { WalletChip } from "./wallet-chip";

const BADGE_LABEL: Record<NetworkId, string> = {
  eip155: "ETH",
  solana: "SOL",
};

export function MerchantCard({ merchant }: { merchant: MerchantConfig }) {
  const Theme = useTheme();
  const initial = merchant.companyName.trim().charAt(0).toUpperCase() || "M";

  // Resolve an address per settlement namespace, falling back to the legacy
  // single `address` for the active namespace (pre-`addresses` merchants).
  const addresses =
    merchant.addresses ?? ({ [merchant.namespace]: merchant.address } as const);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Theme["foreground-primary"],
          borderColor: Theme["border-primary"],
        },
      ]}
    >
      <View style={styles.header}>
        {merchant.logoUri ? (
          <Image source={{ uri: merchant.logoUri }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}>
            <ThemedText
              weight="500"
              color="text-white"
              style={styles.avatarText}
            >
              {initial}
            </ThemedText>
          </View>
        )}
        <View style={styles.flex}>
          <ThemedText weight="500" style={styles.name} numberOfLines={1}>
            {merchant.companyName}
          </ThemedText>
          <ThemedText color="text-secondary" style={styles.sub}>
            Active merchant
          </ThemedText>
        </View>
      </View>

      <View
        style={[
          styles.walletBox,
          { backgroundColor: Theme["foreground-secondary"] },
        ]}
      >
        <ThemedText color="text-secondary" style={styles.label}>
          SETTLEMENT WALLET
        </ThemedText>
        {merchant.networks.map((id) => {
          const net = getNetwork(id);
          const addr = addresses[id];
          return (
            <View key={id} style={styles.addrRow}>
              <View
                style={[styles.badge, { backgroundColor: `${net.color}22` }]}
              >
                <ThemedText
                  weight="500"
                  style={[styles.badgeText, { color: net.color }]}
                >
                  {BADGE_LABEL[id]}
                </ThemedText>
              </View>
              {addr ? (
                <WalletChip address={addr} bare />
              ) : (
                <ThemedText color="text-tertiary" style={styles.notConnected}>
                  Not connected
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius["7"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-4"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-4"],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius["4"],
    backgroundColor: "#3b99fc",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius["4"],
  },
  avatarText: {
    fontSize: 20,
  },
  flex: { flex: 1 },
  name: {
    fontSize: 17,
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  walletBox: {
    borderRadius: BorderRadius["4"],
    paddingVertical: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-4"],
    gap: Spacing["spacing-2"],
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  addrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  badge: {
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 7,
    minWidth: 40,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
  },
  notConnected: {
    fontSize: 13,
  },
});
