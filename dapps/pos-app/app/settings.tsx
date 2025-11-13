import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { resetNavigation } from "@/utils/navigation";
import { useAppKitTheme } from "@reown/appkit-react-native";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Settings() {
  const { themeMode, setThemeMode } = useSettingsStore((state) => state);
  const { setThemeMode: setAppKitThemeMode } = useAppKitTheme();

  const handleThemeModeChange = (value: boolean) => {
    const newThemeMode = value ? "dark" : "light";
    setThemeMode(newThemeMode);
    setAppKitThemeMode(newThemeMode);
  };

  const handleRecipientPress = () => {
    router.push("/settings-address-list");
  };

  const handleNetworksPress = () => {
    router.push("/settings-networks");
  };

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
      <Card onPress={handleRecipientPress} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Recipient addresses
        </ThemedText>
      </Card>
      <Card onPress={handleNetworksPress} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Networks
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
