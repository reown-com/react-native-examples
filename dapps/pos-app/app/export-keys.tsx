import { Button } from "@/components/button";
import { PinModal } from "@/components/pin-modal";
import QRCode from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { usePinGate } from "@/hooks/use-pin-gate";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { encodeDeviceSetupQr } from "@/utils/device-setup-qr";
import { MerchantConfig } from "@/utils/merchant-config";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const isWeb = Platform.OS === "web";

export default function ExportKeysScreen() {
  const theme = useTheme();
  const storedMerchantId = useSettingsStore((state) => state.merchantId);
  const getCustomerApiKey = useSettingsStore(
    (state) => state.getCustomerApiKey,
  );

  const {
    activeModal,
    pinError,
    requireAuth,
    handlePinVerifyComplete,
    handlePinSetupComplete,
    handleBiometricSuccess,
    handleBiometricFailure,
    cancel,
  } = usePinGate();
  const { biometricLabel, canUseBiometric, authenticate } = useBiometricAuth();

  const [unlocked, setUnlocked] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const startedRef = useRef(false);

  const leaveScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/update-keys");
    }
  }, []);

  // Export is web-only (native must have no path to reveal credentials) and
  // never exposes the bundled default keys. Require a PIN once before anything
  // sensitive is read; a locked-out user is sent back, not left on a blank
  // screen.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!isWeb || MerchantConfig.isUsingDefaultKeys(storedMerchantId)) {
      leaveScreen();
      return;
    }
    requireAuth(() => setUnlocked(true), leaveScreen);
  }, [requireAuth, leaveScreen, storedMerchantId]);

  // Read the customer key only after the user has unlocked.
  useEffect(() => {
    if (!unlocked) return;
    let active = true;
    (async () => {
      const customerApiKey = await getCustomerApiKey();
      if (!active) return;
      if (storedMerchantId && customerApiKey) {
        setQrValue(
          encodeDeviceSetupQr({
            merchantId: storedMerchantId,
            customerApiKey,
          }),
        );
      } else {
        setQrValue(null);
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [unlocked, storedMerchantId, getCustomerApiKey]);

  const handleBiometricAuth = useCallback(async () => {
    const success = await authenticate(`Use ${biometricLabel} to export keys`);
    if (success) {
      handleBiometricSuccess();
    } else {
      handleBiometricFailure();
    }
  }, [
    authenticate,
    biometricLabel,
    handleBiometricSuccess,
    handleBiometricFailure,
  ]);

  // Cancelling the PIN prompt leaves the screen entirely.
  const handleCancel = useCallback(() => {
    cancel();
    leaveScreen();
  }, [cancel, leaveScreen]);

  return (
    <View style={styles.container}>
      {unlocked && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {!isLoading && !qrValue ? (
            <>
              <ThemedText
                fontSize={16}
                lineHeight={22}
                color="text-secondary"
                style={styles.centerText}
              >
                Set a merchant ID and customer API key first.
              </ThemedText>
              <Button
                onPress={leaveScreen}
                style={[
                  styles.cta,
                  { backgroundColor: theme["bg-accent-primary"] },
                ]}
              >
                <ThemedText fontSize={16} lineHeight={18} color="text-invert">
                  Go to Update keys
                </ThemedText>
              </Button>
            </>
          ) : (
            <>
              <ThemedText
                fontSize={16}
                lineHeight={22}
                color="text-secondary"
                style={styles.centerText}
              >
                On the new device, open Settings → Update keys → Import keys,
                then scan this setup code.
              </ThemedText>

              <QRCode size={280} uri={qrValue ?? undefined} arenaClear />

              <View
                style={[
                  styles.warning,
                  {
                    backgroundColor: theme["foreground-primary"],
                    borderColor: theme["border-primary"],
                  },
                ]}
              >
                <ThemedText fontSize={14} lineHeight={20} color="text-tertiary">
                  Anyone who scans this gets full access to your merchant
                  account. Only show it to devices you trust, and don&apos;t
                  share a photo of it.
                </ThemedText>
              </View>
            </>
          )}
        </ScrollView>
      )}

      <PinModal
        visible={activeModal !== "none"}
        title={activeModal === "pin-verify" ? "Enter PIN" : "Create PIN"}
        subtitle={
          activeModal === "pin-verify"
            ? "Enter your PIN to export keys."
            : "Set a 4-digit PIN to protect your settings."
        }
        onComplete={
          activeModal === "pin-verify"
            ? handlePinVerifyComplete
            : handlePinSetupComplete
        }
        onCancel={handleCancel}
        error={pinError}
        showBiometric={activeModal === "pin-verify" && !!canUseBiometric}
        onBiometricPress={handleBiometricAuth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-6"],
    gap: Spacing["spacing-6"],
  },
  centerText: {
    textAlign: "center",
  },
  cta: {
    height: 56,
    borderRadius: BorderRadius["4"],
    paddingHorizontal: Spacing["spacing-6"],
    justifyContent: "center",
    alignItems: "center",
  },
  warning: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing["spacing-4"],
  },
});
