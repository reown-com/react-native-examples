import { Button } from "@/components/button";
import { Pressable } from "@/components/pressable";
import { ScanCorners } from "@/components/scan-corners";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePendingSetupStore } from "@/store/usePendingSetupStore";
import { parseSetupQr } from "@/utils/parse-setup-qr";
import { showErrorToast } from "@/utils/toast";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router, useIsFocused } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCAN_AREA_SIZE = 260;

export default function ScanSetupQrScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const setPendingSetup = usePendingSetupStore(
    (state) => state.setPendingSetup,
  );
  const [assets] = useAssets([require("@/assets/images/close.png")]);

  // Guards against the scanner firing multiple times before the screen pops.
  const handledRef = useRef(false);
  // The scanner fires continuously while a QR is in frame; only flag each
  // unrecognized code once so the error toast doesn't spam.
  const lastRejectedRef = useRef<string | null>(null);

  // Whether we've already shown the permission prompt on this screen. After
  // that, a missing permission gets an explicit action instead of re-prompting.
  const [hasAsked, setHasAsked] = useState(false);
  const autoRequestedRef = useRef(false);

  const askForPermission = useCallback(() => {
    requestPermission().finally(() => setHasAsked(true));
  }, [requestPermission]);

  // Ask once on mount, and only while the permission is undetermined.
  // `canAskAgain` can't gate this: expo-camera's web implementation always
  // reports true, and Android keeps it true after a first denial, so it would
  // re-prompt (on web, loop) right after the merchant denies.
  useEffect(() => {
    if (permission?.status === "undetermined" && !autoRequestedRef.current) {
      autoRequestedRef.current = true;
      askForPermission();
    }
  }, [permission, askForPermission]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (handledRef.current) return;
    const value = result.data?.trim();
    if (!value) return;
    const payload = parseSetupQr(value);
    if (!payload) {
      if (lastRejectedRef.current !== value) {
        lastRejectedRef.current = value;
        showErrorToast(
          "This isn't a credentials QR code. Use the one from your merchant dashboard.",
        );
      }
      return;
    }
    handledRef.current = true;
    setPendingSetup(payload);
    router.back();
  };

  const close = () => router.back();

  const needsPermission =
    !!permission &&
    !permission.granted &&
    (permission.status === "denied" || hasAsked);
  // Native can only re-prompt while the OS allows it; otherwise the merchant has
  // to enable it in Settings. On web, retrying re-runs the browser prompt.
  const canPrompt = Platform.OS === "web" || !!permission?.canAskAgain;

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
            <ScanCorners size={SCAN_AREA_SIZE} color="#FFFFFF" />
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
            {needsPermission
              ? canPrompt
                ? "Camera access is off. Allow it to scan the credentials QR code."
                : "Camera access is off. Enable it in your device settings to scan."
              : "Point your camera at the credentials QR code from your merchant dashboard"}
          </ThemedText>
        </View>
      </View>

      {/* Close button, top-left, above the safe-area inset. */}
      <Pressable
        onPress={close}
        accessibilityLabel="Close scanner"
        style={[
          styles.closeButton,
          {
            top: insets.top + Spacing["spacing-2"],
            borderColor: "rgba(255, 255, 255, 0.4)",
          },
        ]}
      >
        <Image
          source={assets?.[0]}
          style={styles.closeIcon}
          tintColor="#FFFFFF"
          cachePolicy="memory-disk"
        />
      </Pressable>

      {needsPermission ? (
        <View
          style={[
            styles.deniedActions,
            { bottom: insets.bottom + Spacing["spacing-6"] },
          ]}
        >
          <Button
            type="accent"
            variant="primary"
            onPress={
              canPrompt ? askForPermission : () => Linking.openSettings()
            }
          >
            {canPrompt ? "Allow camera" : "Open settings"}
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
    left: Spacing["spacing-5"],
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
