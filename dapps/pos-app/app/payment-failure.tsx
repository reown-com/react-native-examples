import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { getPaymentErrorMessage } from "@/utils/payment-errors";
import { useAssets } from "expo-asset";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  errorCode: string; // Error status from API (e.g., "expired") or error code (e.g., "invalid_api_key")
}

export default function PaymentFailureScreen() {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([require("@/assets/images/warning_circle.png")]);

  const { title, subtitle } = getPaymentErrorMessage(params.errorCode);

  const handleRetry = () => {
    router.dismissTo("/amount");
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
            fontSize={16}
            lineHeight={18}
            style={{ color: Theme["text-invert"] }}
          >
            New payment
          </ThemedText>
          <Image
            source={require("@/assets/images/plus.png")}
            style={styles.plusIcon}
            tintColor={Theme["text-invert"]}
          />
        </Button>
      </View>
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
    gap: Spacing["spacing-2"],
  },
  plusIcon: {
    width: 12.5,
    height: 12.5,
  },
});
