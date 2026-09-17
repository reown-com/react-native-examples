import { Button } from "@/components/button";
import { Pressable } from "@/components/pressable";
import { ScanCorners } from "@/components/scan-corners";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePendingApiKeyScanStore } from "@/store/usePendingApiKeyScanStore";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { router, useIsFocused } from "expo-router";
import { useEffect, useRef } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCAN_AREA_SIZE = 260;

// Static bundled icon — render synchronously from the bundle (no async
// useAssets round-trip); see the home screen.
const closeIcon = require("@/assets/images/close.png");

export default function ScanApiKeyScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const setScannedValue = usePendingApiKeyScanStore(
    (state) => state.setScannedValue,
  );

  // Guards against the scanner firing multiple times before the screen pops.
  const handledRef = useRef(false);

  // Ask for camera access as soon as the screen mounts.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (handledRef.current) return;
    const value = result.data?.trim();
    if (!value) return;
    handledRef.current = true;
    setScannedValue(value);
    router.back();
  };

  const close = () => router.back();

  const isDenied = permission?.granted === false && !permission.canAskAgain;

  return (
    <View style={styles.container}>
      {isFocused && permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : null}

      {/* Dimmed mask with a transparent square window (four strips around it). */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.mask} />
        <View style={styles.middleRow}>
          <View style={styles.mask} />
          <View style={styles.window}>
            <ScanCorners
              size={SCAN_AREA_SIZE}
              color="#FFFFFF"
              length={44}
              thickness={4}
              radius={BorderRadius["3"]}
            />
          </View>
          <View style={styles.mask} />
        </View>
        <View style={[styles.mask, styles.bottomMask]}>
          <ThemedText
            fontSize={16}
            lineHeight={22}
            color="text-white"
            style={styles.instruction}
          >
            {isDenied
              ? "Camera access is off. Enable it in your device settings to scan."
              : "Point your camera at the API key QR code"}
          </ThemedText>
        </View>
      </View>

      {/* Close button, top-right, above the safe-area inset. */}
      <Pressable
        onPress={close}
        accessibilityLabel="Close scanner"
        style={[
          styles.closeButton,
          {
            top: insets.top + Spacing["spacing-3"],
            borderColor: "rgba(255, 255, 255, 0.4)",
          },
        ]}
      >
        <Image
          source={closeIcon}
          style={styles.closeIcon}
          tintColor="#FFFFFF"
          cachePolicy="memory-disk"
        />
      </Pressable>

      {isDenied ? (
        <View
          style={[
            styles.deniedActions,
            { bottom: insets.bottom + Spacing["spacing-6"] },
          ]}
        >
          <Button
            type="accent"
            variant="primary"
            onPress={() => Linking.openSettings()}
          >
            Open settings
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const MASK_COLOR = "rgba(0, 0, 0, 0.7)";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mask: {
    flex: 1,
    backgroundColor: MASK_COLOR,
  },
  middleRow: {
    flexDirection: "row",
    height: SCAN_AREA_SIZE,
  },
  window: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  bottomMask: {
    alignItems: "center",
    paddingTop: Spacing["spacing-7"],
    paddingHorizontal: Spacing["spacing-8"],
  },
  instruction: {
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: Spacing["spacing-6"],
    width: 38,
    height: 38,
    borderRadius: BorderRadius["3"],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  deniedActions: {
    position: "absolute",
    left: Spacing["spacing-5"],
    right: Spacing["spacing-5"],
  },
});
