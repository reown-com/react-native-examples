import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { getPaymentErrorMessage } from "@/utils/payment-errors";
import { useAssets } from "expo-asset";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  errorCode: string; // Error code from API (e.g., "INSUFFICIENT_BALANCE")
}

export default function PaymentSuccessScreen() {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([require("@/assets/images/warning_circle.png")]);

  const handleRetry = () => {
    router.dismissTo("/amount");
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={assets?.[0]}
          style={[styles.warningCircle, { tintColor: Theme["icon-error"] }]}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText
          style={[styles.failedText, { color: Theme["text-primary"] }]}
        >
          Payment failed
        </ThemedText>
        <ThemedText
          style={[styles.failedDescription, { color: Theme["text-secondary"] }]}
        >
          {getPaymentErrorMessage(params.errorCode)}
        </ThemedText>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleRetry}
          style={[
            styles.button,
            {
              backgroundColor: Theme["bg-accent-primary"],
            },
          ]}
        >
          <ThemedText
            style={[styles.buttonText, { color: Theme["text-invert"] }]}
          >
            Try again
          </ThemedText>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Spacing["spacing-5"],
  },
  failedText: {
    fontSize: 26,
    lineHeight: 28,
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
  buttonContainer: {
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-5"],
    borderRadius: BorderRadius["5"],
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 20,
  },
});
