import { CheckCircleIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/primary-button";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { WalletChip } from "@/components/wallet-chip";
import { getNetwork, NetworkId } from "@/constants/networks";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import {
  buildOwnershipMessage,
  signOwnership,
} from "@/hooks/use-sign-ownership";
import { syncMerchantToPayCore } from "@/services/merchant";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { getInstallId } from "@/utils/install-id";
import { showErrorToast, showToast } from "@/utils/toast";
import {
  ConnectedAccount,
  getConnectedAccounts,
  getConnectedAddresses,
} from "@/utils/wallet-accounts";
import { useAccount } from "@reown/appkit-react-native";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const BADGE_LABEL: Record<NetworkId, string> = {
  eip155: "ETH",
  solana: "SOL",
};

export default function VerifyScreen() {
  const Theme = useTheme();
  const { address, chainId, namespace } = useAccount();

  // One account per connected namespace. Fall back to the active account if the
  // controller hasn't surfaced connections yet.
  const accounts = useMemo<ConnectedAccount[]>(() => {
    const found = getConnectedAccounts();
    if (found.length > 0) return found;
    if (address && namespace) {
      const ns: NetworkId = namespace === "solana" ? "solana" : "eip155";
      return [{ namespace: ns, address, caip: `${ns}:${chainId}:${address}` }];
    }
    return [];
  }, [address, chainId, namespace]);

  // Signing progress lives in the onboarding store so a remount (e.g. wallet's
  // return deep link bouncing us through Welcome → verify) doesn't wipe it.
  const signedNamespaces = useOnboardingStore((s) => s.signedNamespaces);
  const markSigned = useOnboardingStore((s) => s.markSigned);
  const signed = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ns of signedNamespaces) map[ns] = true;
    return map;
  }, [signedNamespaces]);
  const [signingNs, setSigningNs] = useState<NetworkId | null>(null);
  // Synchronous re-entrancy lock: React state updates aren't flushed before a
  // second press can fire, which would dispatch a duplicate sign request.
  const inFlightRef = useRef(false);

  const preview = useMemo(
    () => (accounts[0] ? buildOwnershipMessage(accounts[0].address) : ""),
    [accounts],
  );

  const remaining = accounts.filter((a) => !signed[a.namespace]);
  const allSigned = accounts.length > 0 && remaining.length === 0;
  const multi = accounts.length > 1;

  const onSign = async () => {
    if (inFlightRef.current) return;
    // Sign only the next unsigned account; the user clicks again for the next.
    const nextAccount = accounts.find((a) => !signed[a.namespace]);
    if (!nextAccount) return;
    inFlightRef.current = true;
    try {
      setSigningNs(nextAccount.namespace);
      await signOwnership(nextAccount);
      markSigned(nextAccount.namespace);

      // Read fresh from the store (the React-subscribed `signed` hasn't
      // re-rendered yet) so we know if any signature is still outstanding.
      const signedSet = new Set([
        ...useOnboardingStore.getState().signedNamespaces,
        nextAccount.namespace,
      ]);
      const stillRemaining = accounts.some((a) => !signedSet.has(a.namespace));
      if (stillRemaining) return; // user clicks again for the next message

      // Mark this address verified for the session. Persisted so an app
      // restart with the same connection won't re-prompt; cleared on disconnect.
      if (address) useMerchantStore.getState().markVerified(address);

      // Routing after sign: if the install already has a merchant, this is a
      // "log in / switch wallet" — upsert with the new wallet's addresses and
      // go Home. Otherwise it's first-time onboarding — continue to Tokens.
      const installId = getInstallId();
      const existing = useMerchantStore.getState().findByMerchantId(installId);
      if (existing && address) {
        const ns: NetworkId = namespace === "solana" ? "solana" : "eip155";
        const addresses = getConnectedAddresses();
        if (!addresses[ns]) addresses[ns] = address;
        const { version } = await syncMerchantToPayCore({
          merchantId: existing.merchantId ?? installId,
          companyName: existing.companyName,
          addresses,
          tokens: existing.tokens,
        });
        useMerchantStore.getState().upsertMerchant({
          ...existing,
          address,
          namespace: ns,
          merchantId: existing.merchantId ?? installId,
          version,
          addresses,
          verifiedAt: Date.now(),
        });
        useMerchantStore.getState().setActive(address);
        showToast("Wallet switched");
        router.replace("/home");
      } else {
        router.replace("/onboarding/tokens");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Signing failed";
      showErrorToast(message);
    } finally {
      setSigningNs(null);
      inFlightRef.current = false;
    }
  };

  const signedCount = accounts.filter((a) => signed[a.namespace]).length;
  const buttonLabel = signingNs
    ? multi
      ? `Awaiting signature… (${signedCount + 1}/${accounts.length})`
      : "Awaiting signature…"
    : multi
      ? `Sign message (${signedCount + 1}/${accounts.length})`
      : "Sign message";

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} step="4 of 5" />
      <View style={styles.content}>
        <ProgressBar step={4} total={5} />
        <ThemedText weight="500" style={styles.title}>
          Sign to verify
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.subtitle}>
          {multi
            ? "Sign one message per connected wallet to confirm you own each. This doesn't cost gas."
            : "Sign a message to confirm you own this wallet. This doesn't cost gas."}
        </ThemedText>

        <View style={styles.accounts}>
          {accounts.map((account) => {
            const net = getNetwork(account.namespace);
            const isSigned = signed[account.namespace];
            const isSigning = signingNs === account.namespace;
            return (
              <View
                key={account.namespace}
                style={[
                  styles.accountRow,
                  {
                    backgroundColor: Theme["foreground-primary"],
                    borderColor: isSigned
                      ? Theme["border-accent-primary"]
                      : Theme["border-primary"],
                  },
                ]}
              >
                <View
                  style={[styles.badge, { backgroundColor: `${net.color}22` }]}
                >
                  <ThemedText
                    weight="500"
                    style={[styles.badgeText, { color: net.color }]}
                  >
                    {BADGE_LABEL[account.namespace]}
                  </ThemedText>
                </View>
                <View style={styles.flex}>
                  <WalletChip address={account.address} bare />
                </View>
                {isSigning ? (
                  <ActivityIndicator
                    size="small"
                    color={Theme["icon-accent-primary"]}
                  />
                ) : isSigned ? (
                  <CheckCircleIcon size={22} color={Theme["icon-success"]} />
                ) : (
                  <ThemedText color="text-tertiary" style={styles.pending}>
                    Pending
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>

        <View
          style={[
            styles.messageBox,
            {
              backgroundColor: Theme["foreground-secondary"],
              borderColor: Theme["border-primary"],
            },
          ]}
        >
          <ThemedText color="text-secondary" style={styles.messageLabel}>
            MESSAGE PREVIEW
          </ThemedText>
          <ThemedText color="text-secondary" style={styles.messageText}>
            {preview}
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={buttonLabel}
          onPress={onSign}
          disabled={!!signingNs || accounts.length === 0 || allSigned}
          icon={<CheckCircleIcon size={18} color="#fff" />}
        />
        <ThemedText color="text-secondary" style={styles.note}>
          Free · no gas · doesn&apos;t initiate a transaction
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-2"],
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: Spacing["spacing-6"],
    marginBottom: Spacing["spacing-2"],
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["spacing-6"],
  },
  accounts: {
    gap: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-5"],
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
    borderRadius: BorderRadius["4"],
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-4"],
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
  flex: { flex: 1 },
  pending: {
    fontSize: 13,
  },
  messageBox: {
    borderRadius: BorderRadius["4"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-4"],
  },
  messageLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: Spacing["spacing-2"],
  },
  messageText: {
    fontSize: 12,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-4"],
    gap: Spacing["spacing-3"],
  },
  note: {
    fontSize: 13,
    textAlign: "center",
  },
});
