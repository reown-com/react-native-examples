import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { decodeDeviceSetupQr } from "@/utils/device-setup-qr";
import { showErrorToast } from "@/utils/toast";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Don't spam the "invalid QR" toast for every camera frame.
const INVALID_QR_TOAST_COOLDOWN_MS = 2500;

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = 280;
const scanAreaLeft = (width - SCAN_AREA_SIZE) / 2;
const scanAreaTop = (height - SCAN_AREA_SIZE) / 3;

export default function ScanCustomerKeyScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const setScannedSetup = useSettingsStore((state) => state.setScannedSetup);
  // onBarcodeScanned fires for every frame; guard so we navigate back once.
  const hasScannedRef = useRef(false);
  const lastInvalidToastRef = useRef(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (hasScannedRef.current) return;
      const value = result.data?.trim();
      if (!value) return;

      const payload = decodeDeviceSetupQr(value);
      if (!payload) {
        // Not one of our setup QRs — keep scanning, nudge the user at intervals.
        const now = Date.now();
        if (now - lastInvalidToastRef.current > INVALID_QR_TOAST_COOLDOWN_MS) {
          lastInvalidToastRef.current = now;
          showErrorToast("That QR code isn't a valid setup code");
        }
        return;
      }

      hasScannedRef.current = true;
      setScannedSetup({
        merchantId: payload.merchantId,
        customerApiKey: payload.customerApiKey,
      });
      router.back();
    },
    [setScannedSetup],
  );

  const goBack = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      {permission?.granted && (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onBarcodeScanned}
        />
      )}

      {/* Dimmed surround (plain views — no blur/svg deps) */}
      <View
        style={[styles.dim, { top: 0, left: 0, right: 0, height: scanAreaTop }]}
      />
      <View
        style={[
          styles.dim,
          {
            top: scanAreaTop + SCAN_AREA_SIZE,
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
      />
      <View
        style={[
          styles.dim,
          {
            top: scanAreaTop,
            left: 0,
            width: scanAreaLeft,
            height: SCAN_AREA_SIZE,
          },
        ]}
      />
      <View
        style={[
          styles.dim,
          {
            top: scanAreaTop,
            right: 0,
            width: scanAreaLeft,
            height: SCAN_AREA_SIZE,
          },
        ]}
      />

      {/* Scan-area frame */}
      <View style={[styles.frame, { top: scanAreaTop, left: scanAreaLeft }]} />

      <View style={[styles.instruction, { top: scanAreaTop + SCAN_AREA_SIZE }]}>
        <Text style={styles.instructionText}>
          {permission?.granted
            ? "Scan a setup code from another device"
            : "Camera access is off. Allow it in your device settings to scan."}
        </Text>
      </View>

      <Button
        onPress={goBack}
        style={[
          styles.cancelButton,
          {
            backgroundColor: theme["foreground-primary"],
            bottom: bottom + Spacing["spacing-6"],
          },
        ]}
      >
        <ThemedText color="text-primary" fontSize={16} lineHeight={18}>
          Cancel
        </ThemedText>
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
  dim: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  frame: {
    position: "absolute",
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 4,
    borderColor: "white",
    borderRadius: BorderRadius["5"],
  },
  cancelButton: {
    position: "absolute",
    left: Spacing["spacing-5"],
    right: Spacing["spacing-5"],
    height: 48,
    borderRadius: BorderRadius["4"],
    alignItems: "center",
    justifyContent: "center",
  },
  instruction: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-6"],
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "KH Teka",
    textAlign: "center",
  },
});
