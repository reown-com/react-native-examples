import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [assets] = useAssets([
    require("@/assets/images/plus.png"),
    require("@/assets/images/gear.png"),
  ]);

  const Theme = useTheme();
  const { merchantId, _hasHydrated } = useSettingsStore();

  const handleStartPayment = () => {
    router.push("/amount");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  // Show setup screen if no merchant ID is configured
  if (_hasHydrated && !merchantId) {
    return (
      <View style={styles.container}>
        <View style={styles.setupContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Theme["bg-accent-primary"] + "20" },
            ]}
          >
            <ThemedText fontSize={48}>🏪</ThemedText>
          </View>
          <ThemedText
            fontSize={24}
            lineHeight={28}
            color="text-primary"
            style={styles.setupTitle}
          >
            Welcome to POS
          </ThemedText>
          <ThemedText
            fontSize={14}
            lineHeight={18}
            color="text-secondary"
            style={styles.setupSubtitle}
          >
            Before you can accept payments, you need to configure your merchant
            ID. This ensures payments are sent to the correct addresses.
          </ThemedText>
          <Button
            onPress={handleSettingsPress}
            style={[
              styles.setupButton,
              { backgroundColor: Theme["bg-accent-primary"] },
            ]}
          >
            <ThemedText fontSize={16} lineHeight={18} color="text-white">
              Set Up Merchant ID
            </ThemedText>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        onPress={handleStartPayment}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={assets?.[0]}
          style={styles.actionButtonImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={18}>New sale</ThemedText>
      </Button>
      <Button
        onPress={handleSettingsPress}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={assets?.[1]}
          style={styles.actionButtonImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={18}>Settings</ThemedText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-7"],
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: BorderRadius["5"],
    gap: Spacing["spacing-4"],
  },
  actionButtonImage: {
    width: 32,
    height: 32,
  },
  setupContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-4"],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["spacing-5"],
  },
  setupTitle: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  setupSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["spacing-6"],
  },
  setupButton: {
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-6"],
    borderRadius: BorderRadius["3"],
    width: "100%",
    alignItems: "center",
  },
});
