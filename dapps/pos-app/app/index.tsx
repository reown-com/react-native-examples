import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast } from "@/utils/toast";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const Theme = useTheme();
  const { merchantId, isCustomerApiKeySet } = useSettingsStore();

  const handleStartPayment = () => {
    if (!merchantId || !isCustomerApiKeySet) {
      router.push("/settings");
      showErrorToast("Merchant information not configured");
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
        onPress={handleStartPayment}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/plus.png")}
          style={styles.actionButtonImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={18}>New sale</ThemedText>
      </Button>
      <Button
        onPress={handleActivityPress}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/clock.png")}
          style={styles.actionButtonImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={18}>Activity</ThemedText>
      </Button>
      <Button
        onPress={handleSettingsPress}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/gear.png")}
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
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-7"],
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
