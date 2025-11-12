import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { isValidAddress } from "@/utils/accounts";
import { showErrorToast } from "@/utils/toast";
import { Namespace } from "@/utils/types";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenParams extends UnknownOutputParams {
  namespace: Namespace;
}

export default function SettingsScanAddress() {
  const { bottom } = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();

  const { setNetworkAddress } = useSettingsStore((state) => state);
  const { namespace } = useLocalSearchParams<ScreenParams>();

  const onCodeScanned = (result: BarcodeScanningResult) => {
    console.log(result);
    const address = result.data;
    if (address && isValidAddress(namespace, address)) {
      setNetworkAddress(namespace, address);
    } else {
      showErrorToast("Invalid address");
    }
    router.dismissTo("/settings-address-list");
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {permission?.granted ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13"],
            }}
            onBarcodeScanned={onCodeScanned}
          />
          <CloseButton
            onPress={router.back}
            themeMode="dark"
            style={[
              styles.closeButton,
              {
                borderWidth: 0,
                bottom: bottom + Spacing["spacing-6"],
              },
            ]}
          />
        </>
      ) : (
        <View style={styles.container}>
          <ThemedText>Camera not available</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
