import { CloseButton } from "@/components/close-button";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
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

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = 280;
const scanAreaLeft = (width - SCAN_AREA_SIZE) / 2;
const scanAreaTop = (height - SCAN_AREA_SIZE) / 3;

export default function ScanCustomerKeyScreen() {
  const { top } = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const setScannedCustomerKey = useSettingsStore(
    (state) => state.setScannedCustomerKey,
  );
  // onBarcodeScanned fires for every frame; guard so we navigate back once.
  const hasScannedRef = useRef(false);

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
      hasScannedRef.current = true;
      setScannedCustomerKey(value);
      router.back();
    },
    [setScannedCustomerKey],
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

      <CloseButton
        style={[styles.closeButton, { top: top + Spacing["spacing-4"] }]}
        themeMode="dark"
        onPress={goBack}
      />

      <View style={[styles.instruction, { top: scanAreaTop + SCAN_AREA_SIZE }]}>
        <Text style={styles.instructionText}>
          {permission?.granted
            ? "Scan a QR code containing the customer API key"
            : "Camera not available"}
        </Text>
      </View>
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
  closeButton: {
    position: "absolute",
    right: Spacing["spacing-5"],
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
