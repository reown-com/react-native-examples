import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { resetNavigation } from "@/utils/navigation";
import {
  connectPrinter,
  printWalletConnectReceipt,
  requestBluetoothPermission,
} from "@/utils/printer";
import { showErrorToast } from "@/utils/toast";
import { StyleSheet, View } from "react-native";

export default function Settings() {
  const { themeMode, setThemeMode } = useSettingsStore((state) => state);

  const handleThemeModeChange = (value: boolean) => {
    const newThemeMode = value ? "dark" : "light";
    setThemeMode(newThemeMode);
  };

  const handleTestPrinterPress = async () => {
    try {
      const isBluetoothPermissionGranted = await requestBluetoothPermission();
      if (!isBluetoothPermissionGranted) {
        showErrorToast("Failed to request Bluetooth permission");
        return;
      }
      const isConnected = await connectPrinter();
      if (!isConnected) {
        showErrorToast("Failed to connect to printer");
        return;
      }
      await printWalletConnectReceipt("1234567890", 15, "USDC", "Base");
    } catch (error) {
      console.error("Failed to test printer:", error);
    }
  };

  // const handleRecipientPress = () => {
  //   router.push("/settings-address-list");
  // };

  // const handleNetworksPress = () => {
  //   router.push("/settings-networks");
  // };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Dark Mode
        </ThemedText>
        <Switch
          style={styles.switch}
          value={themeMode === "dark"}
          onValueChange={handleThemeModeChange}
        />
      </Card>
      {/* <Card onPress={handleRecipientPress} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Recipient addresses
        </ThemedText>
      </Card>
      <Card onPress={handleNetworksPress} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Networks
        </ThemedText>
      </Card> */}
      <Card onPress={handleTestPrinterPress} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Test printer
        </ThemedText>
      </Card>
      <CloseButton style={styles.closeButton} onPress={resetNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing["spacing-5"],
    paddingHorizontal: Spacing["spacing-5"],
    gap: Spacing["spacing-3"],
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
  },
  switch: {
    alignSelf: "center",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
