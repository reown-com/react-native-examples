import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast } from "@/utils/toast";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const compactScreenHeight = 700;

export default function HomeScreen() {
  const [assets] = useAssets([
    require("@/assets/images/plus_circle_fill.png"),
    require("@/assets/images/receipt.png"),
    require("@/assets/images/gear.png"),
  ]);

  const Theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
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

  const isCompact = windowHeight < compactScreenHeight;
  const secondaryActionHeight = isCompact ? 112 : 140;
  const primaryActionMinHeight = isCompact ? 200 : 320;
  const topSpacing = isCompact
    ? Spacing["spacing-6"]
    : Spacing["extra-spacing-1"];
  const bottomSpacing = Math.max(
    bottom + Spacing["spacing-3"],
    Spacing["spacing-7"],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topSpacing, paddingBottom: bottomSpacing },
      ]}
    >
      <Button
        testID="start-payment-button"
        onPress={handleStartPayment}
        style={[
          styles.baseActionButton,
          styles.primaryActionButton,
          { minHeight: primaryActionMinHeight },
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
        style={[styles.secondaryActions, { height: secondaryActionHeight }]}
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
    flex: 1,
  },
  primaryActionButton: {
    flex: 1,
    width: "100%",
  },
  secondaryActions: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  actionButtonImage: {
    width: 32,
    height: 32,
  },
});
