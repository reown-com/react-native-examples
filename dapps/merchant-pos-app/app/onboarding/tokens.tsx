import { CheckCircleIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/primary-button";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { TokenChip } from "@/components/token-chip";
import { getNetwork, NetworkId, tokensForNetwork } from "@/constants/networks";
import { Spacing } from "@/constants/spacing";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { showErrorToast } from "@/utils/toast";
import { getConnectedAddresses } from "@/utils/wallet-accounts";
import { useAccount } from "@reown/appkit-react-native";
import { router } from "expo-router";
import { Fragment } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TokensScreen() {
  const { address, namespace } = useAccount();
  const draft = useOnboardingStore();
  const selectedTokens = useOnboardingStore((s) => s.tokens);
  const toggleToken = useOnboardingStore((s) => s.toggleToken);
  const upsertMerchant = useMerchantStore((s) => s.upsertMerchant);
  const setActive = useMerchantStore((s) => s.setActive);

  const onFinish = () => {
    if (!address) {
      showErrorToast("Wallet disconnected — reconnect to finish");
      return;
    }
    const ns: NetworkId = namespace === "solana" ? "solana" : "eip155";
    // Capture an address per connected namespace; ensure the active one is set.
    const addresses = getConnectedAddresses();
    if (!addresses[ns]) addresses[ns] = address;
    upsertMerchant({
      address,
      namespace: ns,
      addresses,
      email: draft.email,
      companyName: draft.companyName,
      logoUri: draft.logoUri,
      networks: draft.networks,
      tokens: draft.tokens,
      verifiedAt: Date.now(),
    });
    setActive(address);
    draft.reset();
    router.replace("/home");
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} step="5 of 5" />
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressBar step={5} total={5} />
        <ThemedText weight="500" style={styles.title}>
          Which tokens do you want to accept?
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.subtitle}>
          You can change this in settings later.
        </ThemedText>

        {draft.networks.map((networkId: NetworkId) => {
          const network = getNetwork(networkId);
          const tokens = tokensForNetwork(networkId);
          return (
            <Fragment key={networkId}>
              <View style={styles.sectionLabel}>
                <View
                  style={[
                    styles.sectionDot,
                    { backgroundColor: network.color },
                  ]}
                />
                <ThemedText color="text-secondary" style={styles.sectionText}>
                  {network.name.toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.grid}>
                {tokens.map((token) => (
                  <View key={token.id} style={styles.gridItem}>
                    <TokenChip
                      token={token}
                      selected={selectedTokens.includes(token.id)}
                      onPress={() => toggleToken(token.id)}
                    />
                  </View>
                ))}
              </View>
            </Fragment>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Finish setup"
          onPress={onFinish}
          disabled={selectedTokens.length === 0}
          icon={<CheckCircleIcon size={18} color="#fff" />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-6"],
  },
  title: {
    fontSize: 22,
    marginTop: Spacing["spacing-6"],
    marginBottom: Spacing["spacing-2"],
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["spacing-2"],
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing["spacing-5"],
    marginBottom: Spacing["spacing-2"],
  },
  sectionDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  sectionText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["spacing-2"],
  },
  gridItem: {
    width: "48%",
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-4"],
  },
});
