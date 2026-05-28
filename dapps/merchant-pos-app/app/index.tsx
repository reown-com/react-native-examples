import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { WcLogo } from "@/components/icons";
import { NetworkId } from "@/constants/networks";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { syncMerchantToPayCore } from "@/services/merchant";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { nukeAllStorage } from "@/utils/dev-reset";
import { getInstallId } from "@/utils/install-id";
import { showErrorToast, showToast } from "@/utils/toast";
import { getConnectedAddresses } from "@/utils/wallet-accounts";
import { useAccount, useAppKit } from "@reown/appkit-react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

const PARTNER_ID = process.env.EXPO_PUBLIC_PAY_PARTNER_ID;

const TRUST_PILLS = ["✓ EVM + Solana", "✓ Self-custody", "✓ Instant QR"];

export default function WelcomeScreen() {
  const Theme = useTheme();
  const { open, disconnect } = useAppKit();
  const { address, isConnected } = useAccount();
  const isRegistered = useMerchantStore((s) => s.isRegistered);
  const findByMerchantId = useMerchantStore((s) => s.findByMerchantId);
  const upsertLocalMerchant = useMerchantStore((s) => s.upsertMerchant);
  const setActive = useMerchantStore((s) => s.setActive);
  const { namespace } = useAccount();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const onboardingStarted = useOnboardingStore((s) => s.started);
  const onboardingVerified = useOnboardingStore((s) => s.verified);
  const [loggingIn, setLoggingIn] = useState(false);
  const handledLogin = useRef(false);
  const [switching, setSwitching] = useState(false);
  const handledSwitchRef = useRef<string | null>(null);

  // When Welcome is shown with a live wallet session, route to the right place.
  // The wallet's return deep link (merchantpos://) lands here, so we resume:
  // registered → Home; verified mid-onboarding → Tokens; started → Verify;
  // new wallet on an existing install merchant → upsert with new addresses → Home.
  useFocusEffect(
    useCallback(() => {
      if (!isConnected || !address || switching) return;

      if (isRegistered(address)) {
        setActive(address);
        router.replace("/home");
        return;
      }

      // Wallet not in registry. If this install already has a merchant from a
      // prior onboarding, upsert it with the new wallet's addresses and route
      // home — no need to re-onboard from scratch.
      const installId = getInstallId();
      const existing = findByMerchantId(installId);
      if (existing && handledSwitchRef.current !== address) {
        handledSwitchRef.current = address;
        (async () => {
          if (!PARTNER_ID) {
            showErrorToast("EXPO_PUBLIC_PAY_PARTNER_ID is not configured");
            return;
          }
          setSwitching(true);
          try {
            const ns: NetworkId = namespace === "solana" ? "solana" : "eip155";
            const addresses = getConnectedAddresses();
            if (!addresses[ns]) addresses[ns] = address;
            const { version } = await syncMerchantToPayCore({
              merchantId: existing.merchantId ?? installId,
              partnerId: PARTNER_ID,
              companyName: existing.companyName,
              addresses,
            });
            upsertLocalMerchant({
              ...existing,
              address,
              namespace: ns,
              merchantId: existing.merchantId ?? installId,
              version,
              addresses,
            });
            setActive(address);
            setLoggingIn(false);
            showToast("Wallet switched");
            router.replace("/home");
          } catch (e) {
            handledSwitchRef.current = null;
            const message =
              e instanceof Error ? e.message : "Failed to update merchant";
            showErrorToast(message);
          } finally {
            setSwitching(false);
          }
        })();
        return;
      }

      if (onboardingVerified) {
        router.replace("/onboarding/tokens");
      } else if (onboardingStarted) {
        router.replace("/onboarding/verify");
      } else if (loggingIn && !handledLogin.current) {
        handledLogin.current = true;
        setLoggingIn(false);
        showErrorToast("No merchant account for this wallet. Tap Get started.");
      }
    }, [
      isConnected,
      address,
      namespace,
      isRegistered,
      findByMerchantId,
      upsertLocalMerchant,
      setActive,
      onboardingVerified,
      onboardingStarted,
      loggingIn,
      switching,
    ]),
  );

  const onGetStarted = () => {
    resetOnboarding();
    router.push("/onboarding/business-details");
  };

  const onLogin = () => {
    handledLogin.current = false;
    setLoggingIn(true);
    open();
  };

  const onDevReset = async () => {
    try {
      await disconnect();
    } catch {
      // ignore — may already be disconnected
    }
    await nukeAllStorage();
    handledLogin.current = false;
    setLoggingIn(false);
    showToast("Storage cleared");
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.logoBlock}>
          <View style={styles.logoRow}>
            <WcLogo size={38} />
            <ThemedText weight="500" style={styles.brand}>
              WalletConnect
            </ThemedText>
          </View>
          <View
            style={[styles.tag, { backgroundColor: Theme["surface-accent"] }]}
          >
            <ThemedText
              weight="500"
              color="text-accent-primary"
              style={styles.tagText}
            >
              Merchant POS
            </ThemedText>
          </View>
        </View>

        <ThemedText weight="500" style={styles.headline}>
          Accept crypto payments.{"\n"}Settle to your wallet.
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.body}>
          Onboard in minutes. No bank account needed. Fees deducted per
          transaction.
        </ThemedText>

        <View style={styles.pills}>
          {TRUST_PILLS.map((pill) => (
            <View
              key={pill}
              style={[
                styles.pill,
                {
                  backgroundColor: Theme["foreground-primary"],
                  borderColor: Theme["border-primary"],
                },
              ]}
            >
              <ThemedText color="text-secondary" style={styles.pillText}>
                {pill}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={onGetStarted} />
        <PrimaryButton label="Log in" variant="secondary" onPress={onLogin} />
        {__DEV__ && (
          <PrimaryButton
            label="Reset storage (dev)"
            variant="ghost"
            onPress={onDevReset}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-8"],
  },
  logoBlock: {
    marginBottom: Spacing["spacing-11"],
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
    marginBottom: Spacing["spacing-3"],
  },
  brand: {
    fontSize: 18,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
  },
  headline: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: Spacing["spacing-4"],
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: Spacing["spacing-10"],
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["spacing-2"],
  },
  pill: {
    borderRadius: 99,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingBottom: Spacing["spacing-4"],
    gap: Spacing["spacing-3"],
  },
});
