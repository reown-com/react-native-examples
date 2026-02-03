import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { Dropdown, DropdownOption } from "@/components/dropdown";
import { MerchantAddressRow } from "@/components/merchant-address-row";
import { MerchantConfirmModal } from "@/components/merchant-confirm-modal";
import { PinModal } from "@/components/pin-modal";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { VariantList, VariantName } from "@/constants/variants";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useMerchantFlow } from "@/hooks/use-merchant-flow";
import { useNfcCapabilities } from "@/hooks/use-nfc-capabilities";
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getBiometricLabel } from "@/utils/biometrics";
import { resetNavigation } from "@/utils/navigation";
import {
  connectPrinter,
  printReceipt,
  requestBluetoothPermission,
} from "@/utils/printer";
import { showErrorToast } from "@/utils/toast";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingsScreen() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const variant = useSettingsStore((state) => state.variant);
  const setVariant = useSettingsStore((state) => state.setVariant);
  const getVariantPrinterLogo = useSettingsStore(
    (state) => state.getVariantPrinterLogo,
  );
  const nfcEnabled = useSettingsStore((state) => state.nfcEnabled);
  const setNfcEnabled = useSettingsStore((state) => state.setNfcEnabled);
  const addLog = useLogsStore((state) => state.addLog);
  const theme = useTheme();

  // NFC capabilities for toggle
  const nfcCapabilities = useNfcCapabilities();

  // Custom hooks for biometrics and merchant flow
  const {
    biometricStatus,
    biometricEnabled,
    biometricLabel,
    canUseBiometric,
    shouldShowBiometricOption,
    handleBiometricToggle,
    authenticate,
  } = useBiometricAuth();

  const {
    merchantIdInput,
    merchantLookupResult,
    merchantLookupError,
    isLoading,
    activeModal,
    pinError,
    pendingMerchantId,
    pendingMerchantAccounts,
    isConfirmDisabled,
    isPinSet,
    handleInputChange,
    handleMerchantConfirm,
    handlePinVerifyComplete,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
    handleConfirmMerchant,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  } = useMerchantFlow();

  const variantOptions: DropdownOption<VariantName>[] = useMemo(
    () =>
      VariantList.map((v) => ({
        value: v.id,
        label: v.name,
      })),
    [],
  );

  const appVersion =
    Platform.OS === "web"
      ? (Constants.expoConfig?.version ?? "Unknown")
      : Application.nativeApplicationVersion;

  const buildVersion =
    Platform.OS === "web" ? "web" : Application.nativeBuildVersion;

  const handleThemeModeChange = (value: boolean) => {
    const newThemeMode = value ? "dark" : "light";
    setThemeMode(newThemeMode);
  };

  const handleVariantChange = (value: VariantName) => {
    setVariant(value);
  };

  const handleNfcToggle = (value: boolean) => {
    // Only check NFC support when trying to enable
    if (value) {
      // Check platform-specific NFC support
      if (Platform.OS === "android" && !nfcCapabilities.isHceSupported) {
        showErrorToast("NFC not supported on this device");
        return;
      }
      if (Platform.OS === "ios" && !nfcCapabilities.isVasAvailable) {
        showErrorToast(nfcCapabilities.vasReason || "NFC not available");
        return;
      }
    }
    setNfcEnabled(value);
  };

  // Show NFC toggle on both platforms when mode is available
  const isNfcModeAvailable = nfcCapabilities.nfcMode !== "none";
  const showNfcToggle = Platform.OS === "android" || Platform.OS === "ios";

  // Get NFC support description
  const getNfcDescription = () => {
    if (nfcCapabilities.isLoading) return "Checking NFC support...";
    if (Platform.OS === "android") {
      return nfcCapabilities.isHceSupported
        ? "Tap to pay via NFC (HCE)"
        : "HCE not supported";
    }
    if (Platform.OS === "ios") {
      return nfcCapabilities.isVasAvailable
        ? "Tap to pay via NFC (VAS)"
        : "VAS not available";
    }
    return "NFC not supported";
  };

  const handleTestPrinterPress = async () => {
    try {
      const isBluetoothPermissionGranted = await requestBluetoothPermission();
      if (!isBluetoothPermissionGranted) {
        addLog(
          "error",
          "Failed to request Bluetooth permission or not granted",
          "settings",
          "handleTestPrinterPress",
        );
        showErrorToast("Failed to request Bluetooth permission");
        return;
      }
      const { connected, error } = await connectPrinter();
      if (!connected) {
        addLog(
          "error",
          error || "Failed to connect to printer",
          "settings",
          "handleTestPrinterPress",
          { error },
        );
        showErrorToast(error || "Failed to connect to printer");
        return;
      }
      await printReceipt(
        "69e4355c-e0d3-42d6-b63b-ce82e23b68e9",
        15,
        "USDC",
        "15",
        6,
        "Base",
        new Date().toLocaleDateString("en-GB"),
        getVariantPrinterLogo(),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addLog("error", errorMessage, "settings", "handleTestPrinterPress");
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticate(
      `Use ${biometricLabel} to change merchant ID`,
    );

    if (success) {
      handleBiometricAuthSuccess();
    } else {
      handleBiometricAuthFailure();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          fontSize={12}
          lineHeight={14}
          color="text-tertiary"
          style={styles.versionText}
        >
          Version {appVersion} ({buildVersion})
        </ThemedText>

        <View style={styles.dropdownSection}>
          <ThemedText
            fontSize={14}
            lineHeight={16}
            color="text-primary"
            style={styles.sectionLabel}
          >
            Theme Variant
          </ThemedText>
          <Dropdown
            options={variantOptions}
            value={variant}
            onChange={handleVariantChange}
            placeholder="Select variant"
          />
        </View>

        <Card style={styles.card}>
          <ThemedText fontSize={16} lineHeight={18}>
            Dark Mode
          </ThemedText>
          <Switch
            style={styles.switch}
            value={themeMode === "dark"}
            onValueChange={handleThemeModeChange}
          />
        </Card>

        {/* NFC Support toggle - Android HCE / iOS VAS */}
        {showNfcToggle && (
          <Card style={styles.card}>
            <View style={styles.biometricRow}>
              <View style={styles.biometricLabel}>
                <ThemedText fontSize={16} lineHeight={18}>
                  NFC Support
                </ThemedText>
                <ThemedText fontSize={12} lineHeight={14} color="text-tertiary">
                  {getNfcDescription()}
                </ThemedText>
              </View>
              <Switch
                style={styles.switch}
                value={nfcEnabled && isNfcModeAvailable}
                onValueChange={handleNfcToggle}
                disabled={nfcCapabilities.isLoading}
              />
            </View>
          </Card>
        )}

        <Card style={styles.merchantCard}>
          <ThemedText fontSize={16} lineHeight={18}>
            Merchant ID
          </ThemedText>
          <View style={styles.merchantInputRow}>
            <TextInput
              value={merchantIdInput}
              onChangeText={handleInputChange}
              placeholder="Enter merchant ID"
              placeholderTextColor={theme["text-tertiary"]}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.merchantInput,
                {
                  borderColor: theme["border-primary"],
                  color: theme["text-primary"],
                  backgroundColor: theme["foreground-secondary"],
                },
              ]}
            />
            <Button
              onPress={handleMerchantConfirm}
              disabled={isConfirmDisabled}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: isConfirmDisabled
                    ? theme["foreground-tertiary"]
                    : theme["bg-accent-primary"],
                },
              ]}
            >
              <ThemedText
                fontSize={14}
                lineHeight={16}
                color="text-white"
                style={styles.confirmButtonLabel}
              >
                {isLoading ? "Loading..." : "Save"}
              </ThemedText>
            </Button>
          </View>

          {merchantLookupError ? (
            <ThemedText
              fontSize={12}
              lineHeight={14}
              color="text-tertiary"
              style={styles.errorText}
            >
              {merchantLookupError}
            </ThemedText>
          ) : null}

          {merchantLookupResult ? (
            <View style={styles.merchantResult}>
              <MerchantAddressRow
                label="EVM"
                value={merchantLookupResult.liquidationAddress}
              />
              <MerchantAddressRow
                label="Solana"
                value={merchantLookupResult.solanaLiquidationAddress}
              />
            </View>
          ) : null}
        </Card>

        {/* Biometric toggle - only show if PIN is set and biometrics available */}
        {shouldShowBiometricOption && biometricStatus && (
          <Card style={styles.card}>
            <View style={styles.biometricRow}>
              <View style={styles.biometricLabel}>
                <ThemedText fontSize={16} lineHeight={18}>
                  {getBiometricLabel(biometricStatus.biometricType)}
                </ThemedText>
                <ThemedText fontSize={12} lineHeight={14} color="text-tertiary">
                  Use instead of PIN
                </ThemedText>
              </View>
              <Switch
                style={styles.switch}
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
              />
            </View>
          </Card>
        )}

        <Card onPress={handleTestPrinterPress} style={styles.card}>
          <ThemedText fontSize={16} lineHeight={18}>
            Test printer
          </ThemedText>
        </Card>

        <Card onPress={() => router.push("/logs")} style={styles.card}>
          <ThemedText fontSize={16} lineHeight={18}>
            View Logs
          </ThemedText>
        </Card>
      </ScrollView>
      <LinearGradient
        colors={[
          theme["bg-primary"] + "00",
          theme["bg-primary"] + "40",
          theme["bg-primary"] + "CC",
          theme["bg-primary"],
        ]}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />
      <CloseButton style={styles.closeButton} onPress={resetNavigation} />

      {/* PIN Verification Modal - for changing existing merchant ID */}
      <PinModal
        visible={activeModal === "pin-verify"}
        title="Enter PIN"
        subtitle="Enter your PIN to change the merchant ID"
        onComplete={handlePinVerifyComplete}
        onCancel={handleCancelSecurityFlow}
        error={pinError}
        showBiometric={canUseBiometric}
        onBiometricPress={handleBiometricAuth}
      />

      {/* PIN Setup Modal - for first-time merchant setup */}
      <PinModal
        visible={activeModal === "pin-setup"}
        title="Create PIN"
        subtitle="Set a 4-digit PIN to protect merchant settings"
        onComplete={handlePinSetupComplete}
        onCancel={handleCancelSecurityFlow}
      />

      {/* Merchant Confirmation Modal */}
      <MerchantConfirmModal
        visible={activeModal === "confirm"}
        merchantId={pendingMerchantId ?? ""}
        merchantAccounts={pendingMerchantAccounts}
        onConfirm={handleConfirmMerchant}
        onCancel={handleCancelSecurityFlow}
        isFirstSetup={!isPinSet()}
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
    gap: Spacing["spacing-3"],
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
  },
  switch: {
    alignSelf: "center",
  },
  dropdownSection: {
    gap: Spacing["spacing-2"],
  },
  sectionLabel: {
    marginLeft: Spacing["spacing-2"],
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  versionText: {
    alignSelf: "flex-end",
    marginBottom: Spacing["spacing-2"],
  },
  merchantCard: {
    gap: Spacing["spacing-3"],
    paddingVertical: Spacing["spacing-5"],
  },
  merchantInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  merchantInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius["3"],
    paddingHorizontal: Spacing["spacing-3"],
    paddingVertical: Spacing["spacing-2"],
    fontSize: 14,
    lineHeight: 16,
    fontFamily: "KH Teka",
    minHeight: 48,
  },
  confirmButton: {
    borderRadius: BorderRadius["3"],
    paddingHorizontal: Spacing["spacing-4"],
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonLabel: {
    textAlign: "center",
    width: "100%",
    verticalAlign: "middle",
  },
  merchantResult: {
    gap: Spacing["spacing-1"],
  },
  errorText: {
    marginTop: -Spacing["spacing-1"],
  },
  biometricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  biometricLabel: {
    gap: Spacing["spacing-1"],
  },
});
