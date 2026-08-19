import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast } from "@/utils/toast";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [assets] = useAssets([
    require("@/assets/images/plus_circle_fill.png"),
    require("@/assets/images/receipt.png"),
    require("@/assets/images/gear.png"),
  ]);

  const Theme = useTheme();
  const merchantId = useSettingsStore((state) => state.merchantId);
  const isCustomerApiKeySet = useSettingsStore(
    (state) => state.isCustomerApiKeySet,
  );

  const handleStartPayment = () => {
    if (!merchantId || !isCustomerApiKeySet) {
      router.push("/settings");
      showErrorToast("Finish setup in Settings before starting a payment.");
      return;
    }

    router.push("/amount");
  };

  const handleActivityPress = () => {
    router.push("/activity");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <View style={styles.container}>
      <Button
        testID="start-payment-button"
        onPress={handleStartPayment}
        style={[
          styles.baseActionButton,
          { height: 320, width: "100%" },
          { backgroundColor: Theme["foreground-primary-fix"] },
        ]}
      >
        <Image
          source={assets?.[0]}
          style={styles.actionButtonImage}
          tintColor={Theme["icon-invert"]}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText style={{ fontWeight: 500 }} fontSize={18}>
          New payment
        </ThemedText>
      </Button>
      <View
        style={{
          flexDirection: "row",
          gap: Spacing["spacing-3"],
          width: "100%",
        }}
      >
        <Button
          testID="activity-button"
          onPress={handleActivityPress}
          style={[
            styles.actionButton,
            styles.baseActionButton,
            { backgroundColor: Theme["foreground-primary-fix"] },
          ]}
        >
          <Image
            source={assets?.[1]}
            style={styles.actionButtonImage}
            tintColor={Theme["icon-invert"]}
            cachePolicy="memory-disk"
            priority="high"
          />
          <ThemedText fontSize={18}>Transactions</ThemedText>
        </Button>
        <Button
          testID="settings-button"
          onPress={handleSettingsPress}
          style={[
            styles.baseActionButton,
            styles.actionButton,
            { backgroundColor: Theme["foreground-primary-fix"] },
          ]}
        >
          <Image
            source={assets?.[2]}
            style={styles.actionButtonImage}
            tintColor={Theme["icon-invert"]}
            cachePolicy="memory-disk"
            priority="high"
          />
          <ThemedText fontSize={18}>Settings</ThemedText>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-7"],
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  baseActionButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius["5"],
    gap: Spacing["spacing-4"],
  },
  actionButton: {
    height: 140,
    width: "48%",
  },
  actionButtonImage: {
    width: 32,
    height: 32,
  },
});
