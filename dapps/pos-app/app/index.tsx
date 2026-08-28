import { Pressable } from "@/components/pressable";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePosBridgeStore } from "@/store/usePosBridgeStore";
import { isTerminalConfigured } from "@/utils/pos-bridge-ui";
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
  const isTablet = useIsTablet();
  const { height: windowHeight } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const [contentWidth, setContentWidth] = useState(0);
  const merchantId = useSettingsStore((state) => state.merchantId);
  const isCustomerApiKeySet = useSettingsStore(
    (state) => state.isCustomerApiKeySet,
  );
  const isBridgeConfigured = usePosBridgeStore((state) => state.isConfigured);

  const handleStartPayment = () => {
    if (
      !isTerminalConfigured(merchantId, isCustomerApiKeySet, isBridgeConfigured)
    ) {
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
  const horizontalPadding = isTablet
    ? Spacing["spacing-8"]
    : Spacing["spacing-5"];
  const actionGap = isTablet ? Spacing["spacing-6"] : Spacing["spacing-3"];
  const secondaryActionSize = isTablet
    ? contentWidth
      ? Math.round((contentWidth - actionGap) / 2)
      : 140
    : isCompact
      ? 112
      : 140;
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
  const topSpacing = isTablet ? Spacing["spacing-11"] : Spacing["spacing-6"];
  const actionLabelSize = isTablet ? 24 : 18;
  const actionLabelLineHeight = isTablet ? 28 : undefined;
  const secondaryActionDimensions = isTablet
    ? {
        flex: 0,
        width: secondaryActionSize,
        height: secondaryActionSize,
      }
    : undefined;

  const handleContentLayout = (event: LayoutChangeEvent) => {
    // Content box width = full width minus the container's horizontal padding,
    // which matches the full-width button's width.
    const measured = event.nativeEvent.layout.width - horizontalPadding * 2;
    if (measured <= 0) return;
    setContentWidth((currentWidth) =>
      currentWidth === measured ? currentWidth : measured,
    );
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
        {
          paddingHorizontal: horizontalPadding,
          paddingTop: topSpacing,
          paddingBottom: bottomSpacing,
          gap: actionGap,
        },
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
          style={[
            styles.actionButtonImage,
            isTablet && styles.actionButtonImageTablet,
          ]}
          tintColor={Theme["icon-invert"]}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText
          style={{ fontWeight: 500 }}
          fontSize={actionLabelSize}
          lineHeight={actionLabelLineHeight}
        >
          New payment
        </ThemedText>
      </Pressable>
      <View
        style={[
          styles.secondaryActions,
          { height: secondaryActionSize, gap: actionGap },
        ]}
      >
        <Pressable
          testID="activity-button"
          accessibilityRole="button"
          accessibilityLabel="Transactions"
          accessibilityHint="Opens your transactions list"
          onPress={handleActivityPress}
          style={[
            styles.actionButton,
            secondaryActionDimensions,
            styles.baseActionButton,
            { backgroundColor: Theme["foreground-primary-fix"] },
          ]}
        >
          <Image
            source={assets?.[1]}
            style={[
              styles.actionButtonImage,
              isTablet && styles.actionButtonImageTablet,
            ]}
            tintColor={Theme["icon-invert"]}
            cachePolicy="memory-disk"
            priority="high"
          />
          <ThemedText
            fontSize={actionLabelSize}
            lineHeight={actionLabelLineHeight}
          >
            Transactions
          </ThemedText>
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
            secondaryActionDimensions,
            { backgroundColor: Theme["foreground-primary-fix"] },
          ]}
        >
          <Image
            source={assets?.[2]}
            style={[
              styles.actionButtonImage,
              isTablet && styles.actionButtonImageTablet,
            ]}
            tintColor={Theme["icon-invert"]}
            cachePolicy="memory-disk"
            priority="high"
          />
          <ThemedText
            fontSize={actionLabelSize}
            lineHeight={actionLabelLineHeight}
          >
            Settings
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
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
  },
  actionButtonImage: {
    width: 32,
    height: 32,
  },
  actionButtonImageTablet: {
    width: 48,
    height: 48,
  },
});
