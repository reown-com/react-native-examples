import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePOS } from "@/context/POSContext";
import { useTheme } from "@/hooks/use-theme-color";
import { createNDEFType4TagHandler } from "@/utils/ndef-type4";
import { showErrorToast, showInfoToast, showSuccessToast } from "@/utils/toast";
import NativeHCEModule, {
  type HCEModuleEvent,
} from "@icedevml/react-native-host-card-emulation/js/NativeHCEModule";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const { isInitialized } = usePOS();
  const [isHCEEnabled, setIsHCEEnabled] = useState(false);

  const Theme = useTheme();

  // Create NDEF Type 4 tag handler with a URI (iOS doesn't support plaintext NDEF records)
  // According to https://gist.github.com/equipter/de2d9e421be9af1615e9b9cad4834ddc
  // iOS only supports URL/URI records, not plaintext
  const handleCAPDU = useMemo(
    () => createNDEFType4TagHandler("https://example.com", false),
    [],
  );

  // Set up HCE event listener
  useEffect(() => {
    const subscription = NativeHCEModule.onEvent(
      async (event: HCEModuleEvent) => {
        try {
          switch (event.type) {
            case "sessionStarted":
              // Session started, can now start HCE
              try {
                await NativeHCEModule.startHCE();
              } catch (error) {
                console.error("Error starting HCE:", error);
                showErrorToast({
                  title: "HCE Error",
                  message: "Failed to start HCE emulation",
                });
                setIsHCEEnabled(false);
              }
              break;

            case "readerDetected":
              console.log("Reader detected");
              break;

            case "readerDeselected":
              console.log("Reader deselected");
              break;

            case "received":
              // Handle incoming APDU using NDEF Type 4 tag handler
              if (!event.arg) {
                console.error("Received APDU event without data");
                break;
              }
              const capdu = event.arg; // APDU in hex string format
              console.log("Received APDU:", capdu);

              try {
                // Process APDU and get response
                const response = handleCAPDU(capdu);
                await NativeHCEModule.respondAPDU(null, response);
                console.log("Responded with:", response);
              } catch (error) {
                console.error("Error processing APDU:", error);
                // Respond with error on failure
                await NativeHCEModule.respondAPDU(null, "6F00");
              }
              break;

            default:
              break;
          }
        } catch (error) {
          console.error("Error in HCE event handler:", error);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [handleCAPDU]);

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
      if (isHCEEnabled) {
        // Stop HCE session
        // Note: The library doesn't have a direct stop method in the README
        // We may need to end the session differently
        setIsHCEEnabled(false);
        showSuccessToast({
          title: "HCE Disabled",
          message: "NFC tag emulation stopped",
        });
      } else {
        // Start HCE session
        await NativeHCEModule.beginSession();
        setIsHCEEnabled(true);
        showSuccessToast({
          title: "HCE Enabled",
          message: "NFC tag is now emulating. Tap to scan.",
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
