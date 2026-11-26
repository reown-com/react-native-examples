import { NetworkMark } from "@/components/chain-token-icons";
import { OptionRow } from "@/components/option-row";
import { PrimaryButton } from "@/components/primary-button";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { NETWORKS } from "@/constants/networks";
import { Spacing } from "@/constants/spacing";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function NetworksScreen() {
  const networks = useOnboardingStore((s) => s.networks);
  const toggleNetwork = useOnboardingStore((s) => s.toggleNetwork);

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} step="2 of 5" />
      <ScrollView contentContainerStyle={styles.content}>
        <ProgressBar step={2} total={5} />
        <ThemedText weight="500" style={styles.title}>
          Where do you want to settle?
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.subtitle}>
          This app settles in crypto only. Select at least one network.
        </ThemedText>

        {NETWORKS.map((network) => (
          <OptionRow
            key={network.id}
            title={network.name}
            subtitle={network.subtitle}
            icon={<NetworkMark network={network.id} size={26} />}
            selected={networks.includes(network.id)}
            onPress={() => toggleNetwork(network.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => router.push("/onboarding/connect-wallet")}
          disabled={networks.length === 0}
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
    marginBottom: Spacing["spacing-7"],
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-4"],
  },
});
