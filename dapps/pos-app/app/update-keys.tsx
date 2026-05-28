import { Button } from "@/components/button";
import { PinModal } from "@/components/pin-modal";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useMerchantFlow } from "@/hooks/use-merchant-flow";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { MerchantConfig } from "@/utils/merchant-config";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const isNative = Platform.OS !== "web";

export default function UpdateKeysScreen() {
  const theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/scan.png")]);

  const scannedCustomerKey = useSettingsStore(
    (state) => state.scannedCustomerKey,
  );
  const setScannedCustomerKey = useSettingsStore(
    (state) => state.setScannedCustomerKey,
  );

  const {
    merchantIdInput,
    customerApiKeyInput,
    activeModal,
    pinError,
    isUpdateKeysConfirmDisabled,
    hasStoredCustomerApiKey,
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    handleUpdateKeysConfirm,
    handlePinVerifyComplete,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  } = useMerchantFlow();

  const { biometricLabel, canUseBiometric, authenticate } = useBiometricAuth();

  // Apply a value handed back by the QR scanner, then clear the hand-off.
  useFocusEffect(
    useCallback(() => {
      if (scannedCustomerKey) {
        handleCustomerApiKeyInputChange(scannedCustomerKey);
        setScannedCustomerKey(null);
      }
    }, [
      scannedCustomerKey,
      handleCustomerApiKeyInputChange,
      setScannedCustomerKey,
    ]),
  );

  const handleBiometricAuth = useCallback(async () => {
    const success = await authenticate(`Use ${biometricLabel} to update keys`);
    if (success) {
      handleBiometricAuthSuccess();
    } else {
      handleBiometricAuthFailure();
    }
  }, [
    authenticate,
    biometricLabel,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
  ]);

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

  const inputStyle = [
    styles.input,
    {
      borderColor: theme["border-primary"],
      color: theme["text-primary"],
      backgroundColor: theme["foreground-primary"],
    },
  ];

  return (
    <View style={styles.container}>
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
            placeholder="Enter merchant ID"
            placeholderTextColor={theme["text-tertiary"]}
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
          <View style={styles.inputRow}>
            <TextInput
              value={customerApiKeyInput}
              onChangeText={handleCustomerApiKeyInputChange}
              placeholder={
                hasStoredCustomerApiKey
                  ? "Enter new customer API key"
                  : "Enter customer API key"
              }
              placeholderTextColor={theme["text-tertiary"]}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={[inputStyle, isNative && styles.inputWithAction]}
            />
            {isNative && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Scan customer API key QR code"
                onPress={() => router.push("/scan-customer-key")}
                style={styles.scanButton}
                hitSlop={8}
              >
                <Image
                  source={assets?.[0]}
                  style={[
                    styles.scanIcon,
                    { tintColor: theme["text-primary"] },
                  ]}
                  tintColor={theme["text-primary"]}
                  cachePolicy="memory-disk"
                />
              </Pressable>
            )}
          </View>
        </View>

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
            Save
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
      </ScrollView>

      <PinModal
        visible={activeModal !== "none"}
        title={activeModal === "pin-verify" ? "Enter PIN" : "Create PIN"}
        subtitle={
          activeModal === "pin-verify"
            ? "Enter your PIN to save these settings."
            : "Set a 4-digit PIN to protect your settings."
        }
        onComplete={
          activeModal === "pin-verify"
            ? handlePinVerifyComplete
            : handlePinSetupComplete
        }
        onCancel={handleCancelSecurityFlow}
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
    paddingHorizontal: Spacing["spacing-5"],
  },
  content: {
    paddingTop: Spacing["spacing-5"],
    paddingBottom: Spacing["extra-spacing-2"],
    gap: Spacing["spacing-5"],
  },
  field: {
    gap: Spacing["spacing-2"],
  },
  inputRow: {
    position: "relative",
    justifyContent: "center",
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
  inputWithAction: {
    paddingRight: Spacing["spacing-12"],
  },
  scanButton: {
    position: "absolute",
    right: Spacing["spacing-4"],
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  scanIcon: {
    width: 24,
    height: 24,
  },
  saveButton: {
    borderRadius: BorderRadius["4"],
    paddingVertical: Spacing["spacing-4"],
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonLabel: {
    textAlign: "center",
  },
  resetLink: {
    alignSelf: "center",
    paddingVertical: Spacing["spacing-3"],
    marginTop: Spacing["spacing-2"],
  },
  resetLabel: {
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
