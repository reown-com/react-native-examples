import { getMerchantAccounts, MerchantAccounts } from "@/api/merchant";
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
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  authenticateWithBiometrics,
  BiometricStatus,
  getBiometricLabel,
  getBiometricStatus,
} from "@/utils/biometrics";
import { resetNavigation } from "@/utils/navigation";
import {
  connectPrinter,
  printReceipt,
  requestBluetoothPermission,
} from "@/utils/printer";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Settings() {
  const {
    themeMode,
    setThemeMode,
    variant,
    setVariant,
    getVariantPrinterLogo,
    merchantId: storedMerchantId,
    setMerchantId,
    _hasHydrated,
    isPinSet,
    verifyPin,
    setPin,
    isLockedOut,
    getLockoutRemainingSeconds,
    pinFailedAttempts,
    biometricEnabled,
    setBiometricEnabled,
  } = useSettingsStore((state) => state);
  const addLog = useLogsStore((state) => state.addLog);
  const theme = useTheme();
  const [merchantIdInput, setMerchantIdInput] = useState(
    storedMerchantId ?? "",
  );
  const [merchantLookupResult, setMerchantLookupResult] =
    useState<MerchantAccounts | null>(null);
  const [merchantLookupError, setMerchantLookupError] = useState<string | null>(
    null,
  );
  const [isMerchantLookupLoading, setIsMerchantLookupLoading] = useState(false);
  const hasRefetchedMerchant = useRef(false);

  // Security modal states
  const [showPinVerifyModal, setShowPinVerifyModal] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pendingMerchantId, setPendingMerchantId] = useState<string | null>(
    null,
  );
  const [pendingMerchantAccounts, setPendingMerchantAccounts] =
    useState<MerchantAccounts | null>(null);
  const [biometricStatus, setBiometricStatus] =
    useState<BiometricStatus | null>(null);

  const variantOptions: DropdownOption<VariantName>[] = useMemo(
    () =>
      VariantList.map((variant) => ({
        value: variant.id,
        label: variant.name,
      })),
    [],
  );

  const appVersion =
    Platform.OS === "web"
      ? (Constants.expoConfig?.version ?? "Unknown")
      : Application.nativeApplicationVersion;

  const buildVersion =
    Platform.OS === "web" ? "web" : Application.nativeBuildVersion;

  useEffect(() => {
    setMerchantIdInput(storedMerchantId ?? "");
    if (!storedMerchantId) {
      setMerchantLookupResult(null);
    }
  }, [storedMerchantId]);

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      const status = await getBiometricStatus();
      setBiometricStatus(status);
    };
    checkBiometrics();
  }, []);

  const handleMerchantIdChange = (value: string) => {
    setMerchantIdInput(value);
    if (merchantLookupError) {
      setMerchantLookupError(null);
    }
    if (merchantLookupResult) {
      setMerchantLookupResult(null);
    }
  };

  const handleThemeModeChange = (value: boolean) => {
    const newThemeMode = value ? "dark" : "light";
    setThemeMode(newThemeMode);
  };

  const handleVariantChange = (value: VariantName) => {
    setVariant(value);
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

  const fetchMerchantAccounts = useCallback(
    async (targetMerchantId: string): Promise<MerchantAccounts | null> => {
      const trimmedMerchantId = targetMerchantId.trim();
      setIsMerchantLookupLoading(true);
      setMerchantLookupError(null);

      const data = await getMerchantAccounts(trimmedMerchantId);
      setMerchantLookupResult(data);

      if (!data) {
        setMerchantLookupError(
          "Invalid merchant ID. Please verify and try again.",
        );
      }

      setIsMerchantLookupLoading(false);
      return data;
    },
    [],
  );

  useEffect(() => {
    if (hasRefetchedMerchant.current) {
      return;
    }

    if (!_hasHydrated || !storedMerchantId) {
      return;
    }

    hasRefetchedMerchant.current = true;
    void fetchMerchantAccounts(storedMerchantId);
  }, [_hasHydrated, storedMerchantId, fetchMerchantAccounts]);

  const handleMerchantConfirm = async () => {
    const trimmedMerchantId = merchantIdInput.trim();
    if (!trimmedMerchantId || isMerchantLookupLoading) {
      return;
    }

    // Check if locked out
    if (isLockedOut()) {
      const remaining = getLockoutRemainingSeconds();
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      showErrorToast(
        `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, "0")}`,
      );
      return;
    }

    // First, verify the merchant ID with the API (strict validation - must succeed)
    const accounts = await fetchMerchantAccounts(trimmedMerchantId);
    if (!accounts) {
      // Don't proceed if verification fails - no more fallback
      return;
    }

    // Store pending data for confirmation flow
    setPendingMerchantId(trimmedMerchantId);
    setPendingMerchantAccounts(accounts);

    // Check if this is a change to existing merchant (requires PIN verification)
    const isChangingMerchant =
      storedMerchantId && storedMerchantId !== trimmedMerchantId && isPinSet();

    if (isChangingMerchant) {
      // Require PIN verification before showing confirmation
      setShowPinVerifyModal(true);
    } else {
      // First-time setup or same merchant - show confirmation directly
      setShowConfirmModal(true);
    }
  };

  const handlePinVerifyComplete = (pin: string) => {
    if (verifyPin(pin)) {
      setPinError(null);
      setShowPinVerifyModal(false);
      // Show confirmation modal after successful PIN verification
      setShowConfirmModal(true);
    } else {
      if (isLockedOut()) {
        setShowPinVerifyModal(false);
        const remaining = getLockoutRemainingSeconds();
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        showErrorToast(
          `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, "0")}`,
        );
      } else {
        const attemptsLeft = 3 - pinFailedAttempts;
        setPinError(
          `Incorrect PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
        );
      }
    }
  };

  const handleConfirmMerchant = () => {
    setShowConfirmModal(false);

    // If PIN is not set, prompt user to create one
    if (!isPinSet()) {
      setShowPinSetupModal(true);
    } else {
      // PIN already set, just save the merchant ID
      completeMerchantSave();
    }
  };

  const handlePinSetupComplete = (pin: string) => {
    setPin(pin);
    setShowPinSetupModal(false);
    completeMerchantSave();
    showSuccessToast("PIN set successfully");
  };

  const completeMerchantSave = () => {
    if (pendingMerchantId) {
      setMerchantId(pendingMerchantId);
      setMerchantLookupResult(pendingMerchantAccounts);
      showSuccessToast("Merchant ID saved successfully");
      addLog(
        "info",
        `Merchant ID updated to: ${pendingMerchantId}`,
        "settings",
        "completeMerchantSave",
      );
    }
    setPendingMerchantId(null);
    setPendingMerchantAccounts(null);
  };

  const handleCancelSecurityFlow = () => {
    setShowPinVerifyModal(false);
    setShowPinSetupModal(false);
    setShowConfirmModal(false);
    setPinError(null);
    setPendingMerchantId(null);
    setPendingMerchantAccounts(null);
    // Reset input to stored value
    setMerchantIdInput(storedMerchantId ?? "");
  };

  const handleBiometricAuth = async () => {
    const biometricLabel = biometricStatus
      ? getBiometricLabel(biometricStatus.biometricType)
      : "Biometric";

    const success = await authenticateWithBiometrics(
      `Use ${biometricLabel} to change merchant ID`,
    );

    if (success) {
      setPinError(null);
      setShowPinVerifyModal(false);
      setShowConfirmModal(true);
    } else {
      setPinError("Biometric authentication failed. Please use PIN.");
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // Verify biometrics work before enabling
      const success = await authenticateWithBiometrics(
        "Authenticate to enable biometric unlock",
      );
      if (success) {
        setBiometricEnabled(true);
        showSuccessToast("Biometric unlock enabled");
      } else {
        showErrorToast("Biometric authentication failed");
      }
    } else {
      setBiometricEnabled(false);
      showSuccessToast("Biometric unlock disabled");
    }
  };

  const isMerchantConfirmDisabled =
    merchantIdInput.trim().length === 0 ||
    isMerchantLookupLoading ||
    merchantIdInput.trim() === storedMerchantId;

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

        {/* Variant Selector */}
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

        <Card style={styles.merchantCard}>
          <ThemedText fontSize={16} lineHeight={18}>
            Merchant ID
          </ThemedText>

          <View style={styles.merchantInputRow}>
            <TextInput
              value={merchantIdInput}
              onChangeText={handleMerchantIdChange}
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
              disabled={isMerchantConfirmDisabled}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: isMerchantConfirmDisabled
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
                {isMerchantLookupLoading ? "Loading..." : "Save"}
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
        {isPinSet() && biometricStatus?.isAvailable && (
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
        visible={showPinVerifyModal}
        title="Enter PIN"
        subtitle="Enter your PIN to change the merchant ID"
        onComplete={handlePinVerifyComplete}
        onCancel={handleCancelSecurityFlow}
        error={pinError}
        showBiometric={biometricEnabled && biometricStatus?.isAvailable}
        onBiometricPress={handleBiometricAuth}
      />

      {/* PIN Setup Modal - for first-time merchant setup */}
      <PinModal
        visible={showPinSetupModal}
        title="Create PIN"
        subtitle="Set a 4-digit PIN to protect merchant settings"
        onComplete={handlePinSetupComplete}
        onCancel={handleCancelSecurityFlow}
      />

      {/* Merchant Confirmation Modal */}
      <MerchantConfirmModal
        visible={showConfirmModal}
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
