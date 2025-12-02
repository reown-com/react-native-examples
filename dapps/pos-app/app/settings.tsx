import { getMerchantAccounts, MerchantAccounts } from "@/api/merchant";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { Dropdown, DropdownOption } from "@/components/dropdown";
import { MerchantAddressRow } from "@/components/merchant-address-row";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { VariantList, VariantName } from "@/constants/variants";
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { resetNavigation } from "@/utils/navigation";
import {
  connectPrinter,
  printReceipt,
  requestBluetoothPermission,
} from "@/utils/printer";
import { showErrorToast } from "@/utils/toast";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";

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
    async (
      targetMerchantId: string,
      {
        persistMerchantId = false,
        preserveCurrentResult = false,
      }: {
        persistMerchantId?: boolean;
        preserveCurrentResult?: boolean;
      } = {},
    ) => {
      const trimmedMerchantId = targetMerchantId.trim();
      setIsMerchantLookupLoading(true);
      setMerchantLookupError(null);
      if (!preserveCurrentResult) {
        setMerchantLookupResult(null);
      }

      const data = await getMerchantAccounts(trimmedMerchantId);

      if (data) {
        if (persistMerchantId) {
          setMerchantId(trimmedMerchantId);
        }
      } else {
        setMerchantLookupError("Merchant ID was not found");
        setMerchantId("");
      }

      setIsMerchantLookupLoading(false);
      setMerchantLookupResult(data);
    },
    [setMerchantId],
  );

  useEffect(() => {
    if (hasRefetchedMerchant.current) {
      return;
    }

    if (!_hasHydrated || !storedMerchantId) {
      return;
    }

    hasRefetchedMerchant.current = true;
    void fetchMerchantAccounts(storedMerchantId, {
      preserveCurrentResult: true,
    });
  }, [_hasHydrated, storedMerchantId, fetchMerchantAccounts]);

  const handleMerchantConfirm = () => {
    const trimmedMerchantId = merchantIdInput.trim();
    if (!trimmedMerchantId || isMerchantLookupLoading) {
      return;
    }

    setMerchantIdInput(trimmedMerchantId);
    void fetchMerchantAccounts(trimmedMerchantId, { persistMerchantId: true });
  };

  const isMerchantConfirmDisabled =
    merchantIdInput.trim().length === 0 || isMerchantLookupLoading;

  return (
    <View style={styles.container}>
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
      <CloseButton style={styles.closeButton} onPress={resetNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
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
  },
  merchantResult: {
    gap: Spacing["spacing-1"],
  },
  errorText: {
    marginTop: -Spacing["spacing-1"],
  },
});
