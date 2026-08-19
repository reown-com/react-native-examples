import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  getPaymentErrorMessage,
  INVALID_API_KEY,
} from "@/utils/payment-errors";
import { useAssets } from "expo-asset";

// The params can't be declared optional here: `UnknownOutputParams` indexes to
// `string | string[]`, so `?` widens to undefined and breaks the constraint.
// Read them through `Partial` below instead, since `scan.tsx` only passes
// `errorCode`/`minAmount` when it has them.
interface ScreenParams extends UnknownOutputParams {
  amount: string;
  errorCode: string; // Error status from API (e.g., "expired") or error code (e.g., "invalid_api_key")
  minAmount: string; // Minimum amount in cents, only set for "amount_too_low"
}

export default function PaymentFailureScreen() {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const params: Partial<ScreenParams> = useLocalSearchParams<ScreenParams>();
  const currencyCode = useSettingsStore((state) => state.currency);
  const [assets] = useAssets([require("@/assets/images/warning_circle.png")]);

  const { title, subtitle } = getPaymentErrorMessage(params.errorCode, {
    minAmountCents: params.minAmount,
    currencyCode,
  });

  // An invalid API key can't be fixed by retrying — the merchant needs Settings.
  const isInvalidApiKey = params.errorCode === INVALID_API_KEY;

  const handlePrimaryPress = () => {
    if (isInvalidApiKey) {
      // Leave the payment flow entirely and land on Settings so the merchant
      // can fix credentials; settings isn't in this stack, so dismissTo won't
      // reach it — pop back to root, then push Settings.
      router.dismissAll();
      router.push("/settings");
      return;
    }
    router.dismissTo("/amount");
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View
        testID="pos-payment-failure"
        nativeID="pos-payment-failure"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={assets?.[0]}
          style={[
            styles.warningCircle,
            { tintColor: Theme["bg-accent-primary"] },
          ]}
          cachePolicy="memory-disk"
          tintColor={Theme["bg-accent-primary"]}
          priority="high"
        />
        <ThemedText
          style={[styles.failedText, { color: Theme["text-primary"] }]}
        >
          {title}
        </ThemedText>
        <ThemedText
          style={[styles.failedDescription, { color: Theme["text-tertiary"] }]}
        >
          {subtitle}
        </ThemedText>
      </View>
      <Button
        onPress={handlePrimaryPress}
        style={[
          styles.button,
          {
            backgroundColor: Theme["bg-accent-primary"],
          },
        ]}
      >
        <ThemedText
          fontSize={18}
          lineHeight={20}
          style={{ color: Theme["text-invert"] }}
        >
          {isInvalidApiKey ? "Go to Settings" : "Start new payment"}
        </ThemedText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-5"],
  },
  failedText: {
    fontSize: 20,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  failedDescription: {
    fontSize: 16,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  warningCircle: {
    width: 48,
    height: 48,
    marginBottom: Spacing["spacing-6"],
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-5"],
    borderRadius: BorderRadius["5"],
  },
});
