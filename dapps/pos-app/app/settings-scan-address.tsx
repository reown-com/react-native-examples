import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { isValidAddress } from "@/utils/accounts";
import { showErrorToast } from "@/utils/toast";
import { Namespace } from "@/utils/types";
import {
  router,
  UnknownOutputParams,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";

interface ScreenParams extends UnknownOutputParams {
  namespace: Namespace;
}

export default function SettingsScanAddress() {
  const { bottom } = useSafeAreaInsets();
  const device = useCameraDevice("back", {
    physicalDevices: ["wide-angle-camera"],
  });
  const { hasPermission, requestPermission } = useCameraPermission();
  const { setNetworkAddress } = useSettingsStore((state) => state);
  const { namespace } = useLocalSearchParams<ScreenParams>();
  const [isActive, setIsActive] = useState(false);

  // Only activate Camera when the app is focused and this screen is currently opened
  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        // Clean up the camera
        setIsActive(false);
      };
    }, []),
  );

  const onCodeScanned = (codes: Code[]) => {
    const address = codes[0].value;
    if (address && isValidAddress(namespace, address)) {
      setNetworkAddress(namespace, address);
    } else {
      //TODO: Check this
      showErrorToast({
        title: "Invalid address",
        message: "Please scan a valid address",
      });
    }
    router.dismissTo("/settings-address-list");
  };

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned,
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {hasPermission && device ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            codeScanner={codeScanner}
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
