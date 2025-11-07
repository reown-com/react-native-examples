import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePOS } from "@/context/POSContext";
import { useTheme } from "@/hooks/use-theme-color";
import { showErrorToast, showInfoToast, showSuccessToast } from "@/utils/toast";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  HCESession,
  NFCTagType4,
  NFCTagType4NDEFContentType,
} from "react-native-hce";

export default function HomeScreen() {
  const { isInitialized } = usePOS();
  const [isHCEEnabled, setIsHCEEnabled] = useState(false);
  const [hceSession, setHceSession] = useState<HCESession | null>(null);

  const Theme = useTheme();

  const handleStartPayment = () => {
    if (!isInitialized) {
      return showInfoToast({
        title: "Please wait for the POS to initialize",
      });
    }
    router.push("/amount");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  const handleToggleHCE = async () => {
    try {
      if (isHCEEnabled && hceSession) {
        // Disable HCE
        await hceSession.setEnabled(false);
        setIsHCEEnabled(false);
        setHceSession(null);
        showSuccessToast({
          title: "HCE Disabled",
          message: "NFC tag emulation stopped",
        });
      } else {
        // Enable HCE
        // Testing with simple text content to verify NDEF formatting
        const testContent = "HELLO WORLD";

        // Create NFC Type 4 tag with text content
        const tag = new NFCTagType4({
          type: NFCTagType4NDEFContentType.Text,
          content: testContent,
          writable: false,
        });

        // Get the session instance
        const session = await HCESession.getInstance();

        // Set the application for the session (must be awaited)
        await session.setApplication(tag);

        // Enable the HCE session
        await session.setEnabled(true);

        setIsHCEEnabled(true);
        setHceSession(session);
        showSuccessToast({
          title: "HCE Enabled",
          message: "NFC tag is now emulating the WalletConnect URI",
        });
      }
    } catch (error) {
      console.error("Error toggling HCE:", error);
      showErrorToast({
        title: "HCE Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to toggle HCE. Make sure NFC is enabled on your device.",
      });
      setIsHCEEnabled(false);
      setHceSession(null);
    }
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
          source={{ uri: "plus" }}
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
          source={{ uri: "gear" }}
          style={styles.actionButtonImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={18}>Settings</ThemedText>
      </Button>
      <Button
        onPress={handleToggleHCE}
        style={[
          styles.actionButton,
          {
            backgroundColor: isHCEEnabled
              ? Theme["icon-error"]
              : Theme["foreground-primary"],
          },
        ]}
      >
        <Image
          source={{ uri: "scan" }}
          style={styles.actionButtonImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={18}>
          {isHCEEnabled ? "Disable NFC" : "Enable NFC"}
        </ThemedText>
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
