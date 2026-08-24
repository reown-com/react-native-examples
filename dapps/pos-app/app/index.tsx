import { Pressable } from "@/components/pressable";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { isSandboxModeAvailable } from "@/utils/feature-flags";
import { showErrorToast } from "@/utils/toast";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const compactScreenHeight = 700;

// Keep the primary "New payment" button close to square on tall screens: cap
// its height relative to its width so it never stretches into a long rectangle.
// A little over 1 keeps it a rectangle that reads as almost-square.
const primaryMaxAspectRatio = 1.3;

export default function HomeScreen() {
  const [assets] = useAssets([
    require("@/assets/images/plus-circle-fill.png"),
    require("@/assets/images/receipt.png"),
    require("@/assets/images/gear.png"),
  ]);

  const Theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const [contentWidth, setContentWidth] = useState(0);
  const merchantId = useSettingsStore((state) => state.merchantId);
  const isCustomerApiKeySet = useSettingsStore(
    (state) => state.isCustomerApiKeySet,
  );
  const sandboxMode = useSettingsStore((state) => state.sandboxMode);

  const handleStartPayment = () => {
    const canUseSandbox = isSandboxModeAvailable && sandboxMode;
    if (!canUseSandbox && (!merchantId || !isCustomerApiKeySet)) {
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
  // Cap the button's height from its actual measured width (the container's
  // content box, via onLayout) so the near-square rule holds regardless of the
  // window size — on web the app renders inside a device-frame, so the window
  // width isn't the button's width. Undefined until measured (button grows).
  const primaryActionMaxHeight = contentWidth
    ? Math.max(
        primaryActionMinHeight,
        Math.round(contentWidth * primaryMaxAspectRatio),
      )
    : undefined;
  const topSpacing = Spacing["spacing-6"];

  const handleContentLayout = (event: LayoutChangeEvent) => {
    // Content box width = full width minus the container's horizontal padding,
    // which matches the full-width button's width.
    const measured = event.nativeEvent.layout.width - Spacing["spacing-5"] * 2;
    if (measured > 0 && measured !== contentWidth) {
      setContentWidth(measured);
    }
  };
  const bottomSpacing = Math.max(
    bottom + Spacing["spacing-3"],
    Spacing["spacing-7"],
  );

  return (
    <View
      onLayout={handleContentLayout}
      style={[
        styles.container,
        { paddingTop: topSpacing, paddingBottom: bottomSpacing },
      ]}
    >
      <Pressable
        testID="start-payment-button"
        accessibilityRole="button"
        accessibilityLabel="New payment"
        accessibilityHint="Starts a new payment"
        onPress={handleStartPayment}
        style={[
          styles.baseActionButton,
          styles.primaryActionButton,
          {
            minHeight: primaryActionMinHeight,
            maxHeight: primaryActionMaxHeight,
          },
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
      </Pressable>
      <View
        style={[styles.secondaryActions, { height: secondaryActionHeight }]}
      >
        <Pressable
          testID="activity-button"
          accessibilityRole="button"
          accessibilityLabel="Transactions"
          accessibilityHint="Opens your transactions list"
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
        </Pressable>
        <Pressable
          testID="settings-button"
          accessibilityRole="button"
          accessibilityLabel="Settings"
          accessibilityHint="Opens settings"
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
        </Pressable>
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
    justifyContent: "flex-end",
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
