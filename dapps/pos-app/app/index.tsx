import { Image, StyleSheet } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePOS } from "@/context/POSContext";
import { useTheme } from "@/hooks/use-theme-color";
import { showInfoToast } from "@/utils/toast";
import { useAppKitState } from "@reown/appkit-react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const { isInitialized } = usePOS();
  const { isConnected } = useAppKitState();

  const Theme = useTheme();

  const handleStartPayment = () => {
    if (!isInitialized) {
      return showInfoToast({
        title: "Please wait for the POS to initialize",
      });
    }

    if (!isConnected) {
      return showInfoToast({
        title: "Please connect your wallet",
        message: "Please connect your wallet to start a payment",
      });
    }
    router.push("/amount");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <ThemedView style={styles.container}>
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
          source={require("@/assets/images/gear.png")}
          style={styles.actionButtonImage}
        />
        <ThemedText fontSize={18}>Settings</ThemedText>
      </Button>
    </ThemedView>
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
