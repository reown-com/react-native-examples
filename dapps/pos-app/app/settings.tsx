import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { PinModal } from "@/components/pin-modal";
import { RadioList, RadioOption } from "@/components/radio-list";
import { SettingsBottomSheet } from "@/components/settings-bottom-sheet";
import { SettingsItem } from "@/components/settings-item";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { VariantList, VariantName } from "@/constants/variants";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useMerchantFlow } from "@/hooks/use-merchant-flow";
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import { getBiometricLabel } from "@/utils/biometrics";
import { CURRENCIES, CurrencyCode, getCurrency } from "@/utils/currency";
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
import { useMemo, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type ActiveSheet =
  | "theme"
  | "walletTheme"
  | "currency"
  | "merchantId"
  | "partnerApiKey"
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
  const setVariant = useSettingsStore((state) => state.setVariant);
  const currency = useSettingsStore((state) => state.currency);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const getVariantPrinterLogo = useSettingsStore(
    (state) => state.getVariantPrinterLogo,
  );
  const addLog = useLogsStore((state) => state.addLog);
  const theme = useTheme();

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [isEditingPartnerKey, setIsEditingPartnerKey] = useState(false);

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
    partnerApiKeyInput,
    activeModal,
    pinError,
    isMerchantIdConfirmDisabled,
    isPartnerApiKeyConfirmDisabled,
    storedPartnerApiKey,
    handleMerchantIdInputChange,
    handlePartnerApiKeyInputChange,
    handleMerchantIdConfirm,
    handlePartnerApiKeyConfirm,
    handlePinVerifyComplete,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  } = useMerchantFlow();

  const variantOptions: RadioOption<VariantName>[] = useMemo(
    () =>
      VariantList.map((v) => ({
        value: v.id,
        label: v.name,
      })),
    [],
  );

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

  const currentVariant = VariantList.find((v) => v.id === variant);
  const currentCurrency = getCurrency(currency);

  const closeSheet = () => {
    setActiveSheet(null);
    setIsEditingPartnerKey(false);
  };

  const handleThemeModeChange = (value: ThemeMode) => {
    setThemeMode(value);
    closeSheet();
  };

  const handleVariantChange = (value: VariantName) => {
    setVariant(value);
    closeSheet();
  };

  const handleCurrencyChange = (value: CurrencyCode) => {
    setCurrency(value);
    closeSheet();
  };

  const handleMerchantIdSave = () => {
    handleMerchantIdConfirm();
    closeSheet();
  };

  const handlePartnerApiKeySave = () => {
    handlePartnerApiKeyConfirm();
    closeSheet();
  };

  const handlePartnerKeyChange = (value: string) => {
    console.log("handlePartnerKeyChange", value);
    if (!isEditingPartnerKey) {
      setIsEditingPartnerKey(true);
    }
    handlePartnerApiKeyInputChange(value);
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
      const currencyData = getCurrency(currency);
      await printReceipt({
        txnId: "69e4355c-e0d3-42d6-b63b-ce82e23b68e9",
        amountFiat: 15,
        currency: currencyData,
        tokenSymbol: "USDC",
        tokenAmount: "15",
        tokenDecimals: 6,
        networkName: "Base",
        date: new Date().toLocaleDateString("en-GB"),
        logoBase64: getVariantPrinterLogo(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addLog("error", errorMessage, "settings", "handleTestPrinterPress");
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticate(
      `Use ${biometricLabel} to change merchant settings`,
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

        <SettingsItem
          title="Theme"
          value={THEME_LABELS[themeMode]}
          onPress={() => setActiveSheet("theme")}
        />

        <SettingsItem
          title="Wallet theme"
          value={currentVariant?.name ?? "Default"}
          onPress={() => setActiveSheet("walletTheme")}
        />

        <SettingsItem
          title="Currency"
          value={`${currentCurrency.name} (${currentCurrency.symbol})`}
          onPress={() => setActiveSheet("currency")}
        />

        <SettingsItem
          title="Merchant ID"
          value={merchantIdInput || undefined}
          onPress={() => setActiveSheet("merchantId")}
        />

        <SettingsItem
          title="Partner API KEY"
          value="**********"
          onPress={() => setActiveSheet("partnerApiKey")}
        />

        {/* Biometric toggle - only show if PIN is set and biometrics available */}
        {shouldShowBiometricOption && biometricStatus && (
          <Card style={styles.biometricCard}>
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

        <SettingsItem title="Test printer" onPress={handleTestPrinterPress} />

        <SettingsItem title="View Logs" onPress={() => router.push("/logs")} />
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

      {/* Wallet Theme Bottom Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === "walletTheme"}
        title="Wallet theme"
        onClose={closeSheet}
      >
        <RadioList
          options={variantOptions}
          value={variant}
          onChange={handleVariantChange}
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
            onPress={handleMerchantIdSave}
            disabled={isMerchantIdConfirmDisabled}
            style={[
              styles.saveButton,
              {
                backgroundColor: isMerchantIdConfirmDisabled
                  ? theme["foreground-tertiary"]
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
        </View>
      </SettingsBottomSheet>

      {/* Partner API Key Bottom Sheet */}
      <SettingsBottomSheet
        visible={activeSheet === "partnerApiKey"}
        title="Partner API KEY"
        onClose={closeSheet}
      >
        <View style={styles.inputContent}>
          <TextInput
            value={
              isEditingPartnerKey
                ? partnerApiKeyInput
                : storedPartnerApiKey || ""
            }
            onChangeText={handlePartnerKeyChange}
            placeholder="Enter partner API key"
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
            onPress={handlePartnerApiKeySave}
            disabled={isPartnerApiKeyConfirmDisabled}
            style={[
              styles.saveButton,
              {
                backgroundColor: isPartnerApiKeyConfirmDisabled
                  ? theme["foreground-tertiary"]
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
        </View>
      </SettingsBottomSheet>

      {/* PIN Verification Modal */}
      <PinModal
        visible={activeModal === "pin-verify"}
        title="Enter PIN"
        subtitle="Enter your PIN to save merchant settings"
        onComplete={handlePinVerifyComplete}
        onCancel={handleCancelSecurityFlow}
        error={pinError}
        showBiometric={canUseBiometric}
        onBiometricPress={handleBiometricAuth}
      />

      {/* PIN Setup Modal */}
      <PinModal
        visible={activeModal === "pin-setup"}
        title="Create PIN"
        subtitle="Set a 4-digit PIN to protect merchant settings"
        onComplete={handlePinSetupComplete}
        onCancel={handleCancelSecurityFlow}
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
  switch: {
    alignSelf: "center",
  },
  biometricCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 68,
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
  saveButton: {
    borderRadius: BorderRadius["4"],
    paddingVertical: Spacing["spacing-4"],
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonLabel: {
    textAlign: "center",
  },
});
