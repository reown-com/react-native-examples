import { Button } from "@/components/button";
import { PinModal } from "@/components/pin-modal";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useMerchantFlow } from "@/hooks/use-merchant-flow";
import { usePinGate } from "@/hooks/use-pin-gate";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { MerchantConfig } from "@/utils/merchant-config";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const isNative = Platform.OS !== "web";
const isWeb = Platform.OS === "web";

export default function UpdateKeysScreen() {
  const theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/scan.png")]);

  const scannedSetup = useSettingsStore((state) => state.scannedSetup);
  const setScannedSetup = useSettingsStore((state) => state.setScannedSetup);

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

  // Leave the screen (after save, on cancel, or when locked out).
  const leaveScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, []);

  // Require a PIN once, on entry. The form stays hidden until it's unlocked;
  // a locked-out user is sent back rather than left on a blank screen.
  const [unlocked, setUnlocked] = useState(false);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    requireAuth(() => setUnlocked(true), leaveScreen);
  }, [requireAuth, leaveScreen]);

  const {
    merchantIdInput,
    customerApiKeyInput,
    storedMerchantId,
    merchantIdChanged,
    customerKeyRequired,
    isUpdateKeysConfirmDisabled,
    hasStoredCustomerApiKey,
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    handleUpdateKeysConfirm,
  } = useMerchantFlow(leaveScreen);

  // Show a masked stand-in so the user knows a key is already saved, until they
  // start editing. The masking drops once the merchant ID changes (the old key
  // no longer applies) so the now-required field reads as empty.
  const [keyEditing, setKeyEditing] = useState(false);
  const showMaskedKey =
    hasStoredCustomerApiKey &&
    !merchantIdChanged &&
    !keyEditing &&
    customerApiKeyInput.length === 0;

  // Apply the credentials handed back by the QR scanner, then clear the
  // hand-off. A setup QR carries both merchant ID and customer key.
  useFocusEffect(
    useCallback(() => {
      if (scannedSetup) {
        if (scannedSetup.merchantId) {
          handleMerchantIdInputChange(scannedSetup.merchantId);
        }
        if (scannedSetup.customerApiKey) {
          handleCustomerApiKeyInputChange(scannedSetup.customerApiKey);
        }
        setScannedSetup(null);
      }
    }, [
      scannedSetup,
      handleMerchantIdInputChange,
      handleCustomerApiKeyInputChange,
      setScannedSetup,
    ]),
  );

  const handleBiometricAuth = useCallback(async () => {
    const success = await authenticate(`Use ${biometricLabel} to update keys`);
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

  const handleResetToDefault = useCallback(() => {
    const defaultMerchantId = MerchantConfig.getDefaultMerchantId();
    const defaultApiKey = MerchantConfig.getDefaultCustomerApiKey();
    if (defaultMerchantId) {
      handleMerchantIdInputChange(defaultMerchantId);
    }
    if (defaultApiKey) {
      handleCustomerApiKeyInputChange(defaultApiKey);
    }
  }, [handleMerchantIdInputChange, handleCustomerApiKeyInputChange]);

  // Export shares the device's currently active credentials, so it requires
  // both to be saved — and never the bundled default keys.
  const canExport =
    !!storedMerchantId &&
    hasStoredCustomerApiKey &&
    !MerchantConfig.isUsingDefaultKeys(storedMerchantId);

  const inputStyle = [
    styles.input,
    {
      borderColor: theme["border-primary"],
      color: theme["text-primary"],
      backgroundColor: theme["foreground-primary"],
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {unlocked && (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Merchant ID */}
            <View style={styles.field}>
              <ThemedText fontSize={14} lineHeight={16} color="text-secondary">
                Merchant ID
              </ThemedText>
              <TextInput
                value={merchantIdInput}
                onChangeText={handleMerchantIdInputChange}
                placeholderTextColor={theme["text-secondary"]}
                autoCapitalize="none"
                autoCorrect={false}
                style={inputStyle}
              />
            </View>

            {/* Customer API Key */}
            <View style={styles.field}>
              <ThemedText fontSize={14} lineHeight={16} color="text-secondary">
                Customer API key
              </ThemedText>
              <TextInput
                value={showMaskedKey ? "*********" : customerApiKeyInput}
                onChangeText={(value) => {
                  if (!keyEditing) setKeyEditing(true);
                  handleCustomerApiKeyInputChange(value);
                }}
                onFocus={() => setKeyEditing(true)}
                placeholder="wcp_…"
                placeholderTextColor={theme["text-secondary"]}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showMaskedKey}
                style={[
                  inputStyle,
                  customerKeyRequired && { borderColor: theme["icon-error"] },
                ]}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {/* Provision this device by scanning another's export QR. */}
            {isNative && (
              <Button
                onPress={() => router.push("/scan-customer-key")}
                style={[
                  styles.secondaryButton,
                  { borderColor: theme["border-primary"] },
                ]}
              >
                <View style={styles.secondaryButtonContent}>
                  <Image
                    source={assets?.[0]}
                    style={[
                      styles.scanIcon,
                      { tintColor: theme["text-primary"] },
                    ]}
                    tintColor={theme["text-primary"]}
                    cachePolicy="memory-disk"
                  />
                  <ThemedText
                    fontSize={16}
                    lineHeight={18}
                    color="text-primary"
                  >
                    Import keys
                  </ThemedText>
                </View>
              </Button>
            )}

            {/* Share this device's keys so another can be set up (web only,
                and never the bundled default keys). */}
            {isWeb && canExport && (
              <Button
                onPress={() => router.push("/export-keys")}
                style={[
                  styles.secondaryButton,
                  { borderColor: theme["border-primary"] },
                ]}
              >
                <ThemedText fontSize={16} lineHeight={18} color="text-primary">
                  Export keys
                </ThemedText>
              </Button>
            )}

            <Button
              onPress={handleUpdateKeysConfirm}
              disabled={isUpdateKeysConfirmDisabled}
              style={[
                styles.saveButton,
                {
                  backgroundColor: isUpdateKeysConfirmDisabled
                    ? theme["foreground-accent-primary-60"]
                    : theme["bg-accent-primary"],
                },
              ]}
            >
              <ThemedText
                fontSize={16}
                lineHeight={18}
                color="text-invert"
                style={styles.saveButtonLabel}
              >
                Save keys
              </ThemedText>
            </Button>

            {MerchantConfig.hasEnvDefaults() && (
              <Pressable
                accessibilityRole="button"
                onPress={handleResetToDefault}
                style={styles.resetLink}
                hitSlop={8}
              >
                <ThemedText
                  fontSize={14}
                  lineHeight={16}
                  color="text-tertiary"
                  style={styles.resetLabel}
                >
                  Reset to default
                </ThemedText>
              </Pressable>
            )}
          </View>
        </>
      )}

      <PinModal
        visible={activeModal !== "none"}
        title={activeModal === "pin-verify" ? "Enter PIN" : "Create PIN"}
        subtitle={
          activeModal === "pin-verify"
            ? "Enter your PIN to manage keys."
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
  },
  content: {
    paddingTop: Spacing["spacing-5"],
    gap: Spacing["spacing-5"],
    // Leave room for the input focus ring so the ScrollView doesn't clip it.
    ...(isWeb && { paddingHorizontal: Spacing["spacing-2"] }),
  },
  field: {
    gap: Spacing["spacing-2"],
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius["4"],
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-4"],
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "KH Teka",
    height: 60,
  },
  footer: {
    paddingTop: Spacing["spacing-4"],
    gap: Spacing["spacing-3"],
    ...(isWeb && { paddingHorizontal: Spacing["spacing-2"] }),
  },
  secondaryButton: {
    height: 56,
    borderWidth: 1,
    borderRadius: BorderRadius["4"],
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  scanIcon: {
    width: 24,
    height: 24,
  },
  saveButton: {
    height: 56,
    borderRadius: BorderRadius["4"],
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonLabel: {
    textAlign: "center",
  },
  resetLink: {
    alignSelf: "center",
    paddingVertical: Spacing["spacing-2"],
  },
  resetLabel: {
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
