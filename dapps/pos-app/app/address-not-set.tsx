import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { resetNavigation } from "@/utils/navigation";
import { useAssets } from "expo-asset";

export default function PaymentSuccessScreen() {
  const Theme = useTheme();
  const insets = useSafeAreaInsets();
  const [assets] = useAssets([require("@/assets/images/warning_circle.png")]);

  const handleGoToSettings = () => {
    resetNavigation("/settings");
    router.push("/settings-address-list");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={assets?.[0]}
          style={[styles.warningCircle, { tintColor: Theme["icon-warning"] }]}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText
          style={[styles.failedText, { color: Theme["text-primary"] }]}
        >
          Address not configured
        </ThemedText>
        <ThemedText
          style={[styles.failedDescription, { color: Theme["text-secondary"] }]}
        >
          You need to set up at least one recipient address to receive crypto
          payments.
        </ThemedText>
        <ThemedText
          style={[styles.failedDescription, { color: Theme["text-secondary"] }]}
        >
          Go to Settings to connect a wallet and add your recipient addresses.
        </ThemedText>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleGoToSettings}
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
            Go to settings
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
