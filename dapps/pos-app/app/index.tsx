import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast } from "@/utils/toast";
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
  const { merchantId, isMerchantApiKeySet } = useSettingsStore();

  const handleStartPayment = () => {
    if (!merchantId || !isMerchantApiKeySet) {
      router.push("/settings");
      showErrorToast("Merchant information not configured");
      return;
    }

    router.push("/amount");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <View style={styles.container}>
      <Button
        testID="new-sale-button"
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
        testID="settings-button"
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
});
