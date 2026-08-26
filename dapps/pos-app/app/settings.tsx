import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { PinModal } from "@/components/pin-modal";
import { RadioList, RadioOption } from "@/components/radio-list";
import { SettingsBottomSheet } from "@/components/settings-bottom-sheet";
import { SettingsItem } from "@/components/settings-item";
import { SettingsSection } from "@/components/settings-section";
import { SettingsToggleItem } from "@/components/settings-toggle-item";
import { SetupBanner } from "@/components/setup-banner";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useMerchantFlow } from "@/hooks/use-merchant-flow";
import { useNfcCapabilities } from "@/hooks/use-nfc-capabilities";
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ThemeMode } from "@/utils/types";
import { getBiometricLabel } from "@/utils/biometrics";
import { buildReceiptLogo } from "@/utils/build-receipt-logo";
import { CURRENCIES, CurrencyCode, getCurrency } from "@/utils/currency";
import { isNfcHceEnabled } from "@/utils/feature-flags";
import {
  connectPrinter,
  printReceipt,
  requestBluetoothPermission,
} from "@/utils/printer";
import { showErrorToast } from "@/utils/toast";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type ActiveSheet =
  | "theme"
  | "currency"
  | "merchantId"
  | "customerApiKey"
  | null;

const THEME_OPTIONS: RadioOption<ThemeMode>[] = [
  {
    value: "system",
    label: "System",
    icon: require("@/assets/images/device-mobile.png"),
  },
  {
    value: "light",
    label: "Light",
    icon: require("@/assets/images/sun.png"),
  },
  {
    value: "dark",
    label: "Dark",
    icon: require("@/assets/images/moon.png"),
  },
];

const THEME_LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export default function SettingsScreen() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const variant = useSettingsStore((state) => state.variant);
  const getVariantPrinterLogo = useSettingsStore(
    (state) => state.getVariantPrinterLogo,
  );
  const currency = useSettingsStore((state) => state.currency);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const nfcEnabled = useSettingsStore((state) => state.nfcEnabled);
  const setNfcEnabled = useSettingsStore((state) => state.setNfcEnabled);
  const nfcCapabilities = useNfcCapabilities();
  const addLog = useLogsStore((state) => state.addLog);
  const logsCount = useLogsStore((state) => state.logs.length);
  const theme = useTheme();

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

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
    customerApiKeyInput,
    isEditingCustomerApiKey,
    storedMerchantId,
    activeModal,
    pinError,
    isMerchantIdConfirmDisabled,
    isCustomerApiKeyConfirmDisabled,
    hasStoredCustomerApiKey,
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    resetCustomerApiKeyInput,
    handleMerchantIdConfirm,
    handleCustomerApiKeyConfirm,
    handlePinVerifyComplete,
    handleBiometricPress,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  } = useMerchantFlow({
    canUseBiometric: !!canUseBiometric,
    authenticate,
    biometricLabel,
  });

  const currencyOptions: RadioOption<CurrencyCode>[] = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        label: `${c.name} (${c.symbol})`,
      })),
    [],
  );

  const appVersion =
    Platform.OS === "web"
      ? (Constants.expoConfig?.version ?? "Unknown")
      : Application.nativeApplicationVersion;

  const buildVersion =
    Platform.OS === "web" ? "web" : Application.nativeBuildVersion;

  const currentCurrency = getCurrency(currency);

  const closeSheet = () => {
    if (activeSheet === "customerApiKey") {
      resetCustomerApiKeyInput();
    }
    setActiveSheet(null);
  };

  const handleThemeModeChange = (value: ThemeMode) => {
    setThemeMode(value);
    closeSheet();
  };

  const handleCurrencyChange = (value: CurrencyCode) => {
    setCurrency(value);
    closeSheet();
  };

  const handleMerchantIdSave = () => {
    closeSheet();
    handleMerchantIdConfirm();
  };

  const handleCustomerApiKeySave = () => {
    closeSheet();
    handleCustomerApiKeyConfirm();
  };

  const showNfcToggle =
    isNfcHceEnabled &&
    Platform.OS === "android" &&
    nfcCapabilities.isHceSupported;

  const showBiometricToggle = shouldShowBiometricOption && !!biometricStatus;

  const hasMerchantId = !!storedMerchantId?.trim();
  const setupRemaining =
    (hasMerchantId ? 0 : 1) + (hasStoredCustomerApiKey ? 0 : 1);

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
        showErrorToast(
          "We need Bluetooth to connect your printer. Allow it in your device settings.",
        );
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
        showErrorToast(
          error ||
            "We couldn't connect to the printer. Check that it's on and paired in your device's Bluetooth settings.",
        );
        return;
      }
      const currencyData = getCurrency(currency);
      // Build the header lockup for the active variant so each one can be
      // test-printed easily; fall back to the pre-built logo on failure.
      const logoBase64 =
        (await buildReceiptLogo(variant)) ?? getVariantPrinterLogo();
      await printReceipt({
        txnId: "69e4355c-e0d3-42d6-b63b-ce82e23b68e9",
        amountFiat: 15,
        currency: currencyData,
        tokenSymbol: "USDC",
        tokenAmount: "15",
        tokenDecimals: 6,
        networkName: "Base",
        date: new Date().toLocaleDateString("en-GB"),
        logoBase64,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addLog("error", errorMessage, "settings", "handleTestPrinterPress");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {setupRemaining > 0 && (
          <SetupBanner
            testID="settings-setup-banner"
            remaining={setupRemaining}
          />
        )}

        <SettingsSection title="Terminal">
          <SettingsItem
            testID="settings-theme"
            title="Theme"
            value={THEME_LABELS[themeMode]}
            onPress={() => setActiveSheet("theme")}
          />

          <SettingsItem
            testID="settings-currency"
            title="Currency"
            value={`${currentCurrency.name} (${currentCurrency.symbol})`}
            onPress={() => setActiveSheet("currency")}
          />
        </SettingsSection>

        <SettingsSection title="Connection">
          <SettingsItem
            testID="settings-merchant-id"
            title="Merchant ID"
            value={hasMerchantId ? merchantIdInput : undefined}
            bullet={!hasMerchantId}
            badge={
              hasMerchantId ? undefined : (
                <Badge
                  label="Not set"
                  backgroundColor="bg-warning"
                  color="text-tertiary"
                />
              )
            }
            caret="right"
            showCaret
            onPress={() => setActiveSheet("merchantId")}
          />

          <SettingsItem
            testID="settings-customer-api-key"
            title="Customer API KEY"
            value={hasStoredCustomerApiKey ? "**********" : undefined}
            bullet={!hasStoredCustomerApiKey}
            badge={
              hasStoredCustomerApiKey ? undefined : (
                <Badge
                  label="Not set"
                  backgroundColor="bg-warning"
                  color="text-tertiary"
                />
              )
            }
            caret="right"
            showCaret
            onPress={() => setActiveSheet("customerApiKey")}
          />

          {showNfcToggle && (
            <SettingsToggleItem
              testID="settings-nfc-toggle"
              title="Tap to pay"
              description="Show NFC prompt"
              value={nfcEnabled}
              onValueChange={setNfcEnabled}
            />
          )}

          {/* Biometric toggle - only show if PIN is set and biometrics available */}
          {showBiometricToggle && (
            <SettingsToggleItem
              testID="settings-biometric-toggle"
              title={getBiometricLabel(biometricStatus.biometricType)}
              description="Use instead of Pin"
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
            />
          )}
        </SettingsSection>

        <SettingsSection title="Device">
          <SettingsItem
            testID="settings-view-logs"
            icon={require("@/assets/images/terminal.png")}
            title="Logs"
            value={`${logsCount} ${logsCount === 1 ? "entry" : "entries"}`}
            caret="right"
            showCaret
            onPress={() => router.push("/logs")}
          />

          {Platform.OS !== "web" && (
            <Button
              type="neutral"
              variant="secondary"
              testID="settings-test-printer"
              onPress={handleTestPrinterPress}
              icon={
                <Image
                  source={require("@/assets/images/printer.png")}
                  style={styles.printerIcon}
                  tintColor={theme["text-primary"]}
                  cachePolicy="memory-disk"
                />
              }
            >
              Print test receipt
            </Button>
          )}
        </SettingsSection>

        <ThemedText
          fontSize={12}
          lineHeight={14}
          color="text-tertiary"
          style={styles.versionText}
        >
          Version {appVersion} ({buildVersion})
        </ThemedText>
      </ScrollView>

      {/* Theme Bottom Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === "theme"}
        title="Theme"
        onClose={closeSheet}
      >
        <RadioList
          options={THEME_OPTIONS}
          value={themeMode}
          onChange={handleThemeModeChange}
        />
      </SettingsBottomSheet>

      {/* Currency Bottom Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === "currency"}
        title="Currency"
        onClose={closeSheet}
      >
        <RadioList
          options={currencyOptions}
          value={currency}
          onChange={handleCurrencyChange}
        />
      </SettingsBottomSheet>

      {/* Merchant ID Bottom Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === "merchantId"}
        title="Merchant ID"
        subtitle="Find your Merchant ID in your merchant dashboard and paste it here."
        onClose={closeSheet}
      >
        <View style={styles.inputContent}>
          <TextInput
            value={merchantIdInput}
            onChangeText={handleMerchantIdInputChange}
            placeholder="Enter merchant ID"
            placeholderTextColor={theme["text-tertiary"]}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.sheetInput,
              {
                borderColor: theme["border-primary"],
                color: theme["text-primary"],
                backgroundColor: theme["foreground-primary"],
              },
            ]}
          />
          <Button
            type="accent"
            variant="primary"
            testID="settings-merchant-save"
            onPress={handleMerchantIdSave}
            disabled={isMerchantIdConfirmDisabled}
          >
            Save
          </Button>
        </View>
      </SettingsBottomSheet>

      {/* Customer API Key Bottom Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === "customerApiKey"}
        title="Customer API key"
        onClose={closeSheet}
      >
        <View style={styles.inputContent}>
          <TextInput
            value={
              isEditingCustomerApiKey
                ? customerApiKeyInput
                : hasStoredCustomerApiKey
                  ? "********"
                  : ""
            }
            onChangeText={handleCustomerApiKeyInputChange}
            placeholder="Enter customer API key"
            placeholderTextColor={theme["text-tertiary"]}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            style={[
              styles.sheetInput,
              {
                borderColor: theme["border-primary"],
                color: theme["text-primary"],
                backgroundColor: theme["foreground-primary"],
              },
            ]}
          />
          <Button
            type="accent"
            variant="primary"
            testID="settings-customer-save"
            onPress={handleCustomerApiKeySave}
            disabled={isCustomerApiKeyConfirmDisabled}
          >
            Save
          </Button>
        </View>
      </SettingsBottomSheet>

      {/* PIN Modal */}
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
        onBiometricPress={handleBiometricPress}
        biometricType={biometricStatus?.biometricType}
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
    paddingBottom: Spacing["spacing-6"],
    gap: Spacing["spacing-7"],
  },
  printerIcon: {
    width: 16,
    height: 16,
  },
  versionText: {
    alignSelf: "flex-end",
    marginVertical: Spacing["spacing-2"],
  },
  inputContent: {
    gap: Spacing["spacing-3"],
  },
  sheetInput: {
    borderWidth: 1,
    borderRadius: BorderRadius["4"],
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-4"],
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "KH Teka",
    height: 60,
  },
});
