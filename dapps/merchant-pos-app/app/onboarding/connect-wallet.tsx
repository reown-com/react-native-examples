import { WalletIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/primary-button";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { getNetwork } from "@/constants/networks";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { scopeNetworksToNamespaces } from "@/utils/network-scope";
import { useAccount, useAppKit } from "@reown/appkit-react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function ConnectWalletScreen() {
  const Theme = useTheme();
  const { open, close, disconnect } = useAppKit();
  const { address, isConnected } = useAccount();
  const networks = useOnboardingStore((s) => s.networks);
  const isRegistered = useMerchantStore((s) => s.isRegistered);
  const [showExists, setShowExists] = useState(false);
  const handled = useRef(false);

  // Scope the AppKit/WC session proposal to the namespaces the merchant
  // selected on Screen 3 so we don't ask the wallet to approve chains they
  // didn't pick.
  useEffect(() => {
    scopeNetworksToNamespaces(networks);
  }, [networks]);

  // React to a wallet connection initiated from this screen.
  useEffect(() => {
    if (!isConnected || !address || handled.current) return;
    handled.current = true;
    if (isRegistered(address)) {
      // Close the AppKit modal first so it doesn't stack over our dialog
      // (a lingering modal backdrop blocks touches on Android).
      close();
      setShowExists(true);
    } else {
      router.push("/onboarding/verify");
    }
  }, [isConnected, address, isRegistered, close]);

  const onConnectDifferent = async () => {
    setShowExists(false);
    handled.current = false;
    await disconnect();
  };

  const onBackToWelcome = async () => {
    setShowExists(false);
    await disconnect();
    router.dismissAll();
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} step="3 of 5" />
      <View style={styles.content}>
        <ProgressBar step={3} total={5} />
        <ThemedText weight="500" style={styles.title}>
          Connect your settlement wallet
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.subtitle}>
          This is where your payments will land.
        </ThemedText>

        <View style={styles.scopeRow}>
          {networks.map((id) => {
            const net = getNetwork(id);
            return (
              <View
                key={id}
                style={[
                  styles.scopePill,
                  {
                    backgroundColor: `${net.color}1A`,
                    borderColor: `${net.color}38`,
                  },
                ]}
              >
                <View
                  style={[styles.scopeDot, { backgroundColor: net.color }]}
                />
                <ThemedText
                  weight="500"
                  style={[styles.scopeText, { color: net.color }]}
                >
                  {net.name}
                </ThemedText>
              </View>
            );
          })}
        </View>

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
              styles.cardIcon,
              { backgroundColor: Theme["surface-accent"] },
            ]}
          >
            <WalletIcon size={26} color={Theme["icon-accent-primary"]} />
          </View>
          <ThemedText weight="500" style={styles.cardTitle}>
            Powered by AppKit
          </ThemedText>
          <ThemedText color="text-secondary" style={styles.cardBody}>
            Connect any EVM or Solana wallet — MetaMask, Phantom, Coinbase
            Wallet and 300+ more.
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Connect wallet"
          onPress={() => open()}
          icon={<WalletIcon size={18} color="#fff" />}
        />
      </View>

      {showExists && (
        <View style={styles.dialogBackdrop}>
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <View
              style={[
                styles.dialogIcon,
                { backgroundColor: Theme["surface-warning"] },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke={Theme["warning"]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <ThemedText weight="500" style={styles.dialogTitle}>
              Wallet already registered
            </ThemedText>
            <ThemedText color="text-secondary" style={styles.dialogBody}>
              This wallet is already linked to a merchant account. Try logging
              in instead, or connect a different wallet.
            </ThemedText>
            <PrimaryButton label="Back to welcome" onPress={onBackToWelcome} />
            <View style={{ height: Spacing["spacing-3"] }} />
            <PrimaryButton
              label="Connect different wallet"
              variant="secondary"
              onPress={onConnectDifferent}
            />
          </View>
        </View>
      )}
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
    marginTop: Spacing["spacing-6"],
    marginBottom: Spacing["spacing-2"],
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["spacing-6"],
  },
  scopeRow: {
    flexDirection: "row",
    gap: Spacing["spacing-2"],
    marginBottom: Spacing["spacing-7"],
  },
  scopePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 99,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  scopeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  scopeText: {
    fontSize: 12,
  },
  card: {
    alignItems: "center",
    borderRadius: BorderRadius["5"],
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: Spacing["spacing-8"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius["4"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-4"],
  },
  cardTitle: {
    fontSize: 17,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-4"],
  },
  dialogBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-5"],
    zIndex: 10,
    elevation: 10,
  },
  dialog: {
    width: "100%",
    borderRadius: BorderRadius["7"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-7"],
  },
  dialogIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-4"],
  },
  dialogTitle: {
    fontSize: 17,
    marginBottom: Spacing["spacing-2"],
  },
  dialogBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["spacing-6"],
  },
});
