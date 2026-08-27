import { Button } from "@/components/button";
import QRCode from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { Spacing } from "@/constants/spacing";
import { useCountdown } from "@/hooks/use-countdown";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useNfcPayment } from "@/hooks/use-nfc-payment";
import { useTheme } from "@/hooks/use-theme-color";
import { usePaymentStatus } from "@/services/hooks";
import { cancelPayment, startPayment } from "@/services/payment";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  amountToCents,
  formatAmountWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { formatCountdown, formatCountdownSpoken } from "@/utils/misc";
import { resetNavigation } from "@/utils/navigation";
import { isNfcHceEnabled } from "@/utils/feature-flags";
import { AMOUNT_TOO_LOW, parseMinAmountCents } from "@/utils/payment-errors";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useAssets } from "expo-asset";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import {
  router,
  Stack,
  UnknownOutputParams,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
}

// Remaining-seconds marks at which to announce the countdown to screen readers
// (descending). One minute left is the primary cue; 30s and 10s add urgency.
const COUNTDOWN_ANNOUNCE_THRESHOLDS = [60, 30, 10];

export default function ScanScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([
    require("@/assets/images/wc-logo-dark.png"),
    require("@/assets/images/nfc.png"),
  ]);

  const [qrUri, setQrUri] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const hasNavigatedRef = useRef(false);

  const deviceId = useSettingsStore((state) => state.deviceId);
  const merchantId = useSettingsStore((state) => state.merchantId);
  const currencyCode = useSettingsStore((state) => state.currency);
  const nfcEnabled = useSettingsStore((state) => state.nfcEnabled);
  const currency = getCurrency(currencyCode);
  const addLog = useLogsStore((state) => state.addLog);
  const Theme = useTheme();
  const isTablet = useIsTablet();

  const { amount } = params;

  const { nfcMode } = useNfcPayment({
    paymentUrl: qrUri,
    // NFC/HCE is gated by a build-time kill-switch (EXPO_PUBLIC_NFC_HCE_ENABLED).
    // When off, no payment URL is emitted and the native side never enables HCE.
    enabled: isNfcHceEnabled,
    onNfcReady: () => {
      addLog("info", "NFC HCE activated", "scan", "useNfcPayment", {
        paymentId,
      });
    },
    onNfcError: (error) => {
      addLog("error", error.message, "scan", "useNfcPayment");
    },
    onTap: () => {
      addLog("info", "NFC tag read by wallet", "scan", "useNfcPayment", {
        paymentId,
      });
    },
  });

  const onSuccess = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    router.dismiss();
    router.replace({
      pathname: "/payment-success",
      params: {
        amount,
        paymentId,
      },
    });
  }, [paymentId, amount]);

  const onFailure = useCallback(
    (errorCode?: string, minAmount?: string) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      router.dismiss();
      router.replace({
        pathname: "/payment-failure",
        params: {
          amount,
          ...(errorCode && { errorCode }),
          ...(minAmount && { minAmount }),
        },
      });
    },
    [amount],
  );

  const handleOnCancelPress = () => {
    // Before the first status poll resolves, `paymentStatusData` is undefined
    // but the payment is already open at the gateway — cancel it then too.
    const status = paymentStatusData?.status;
    if (paymentId && (status === undefined || status === "requires_action")) {
      cancelPayment(paymentId).catch((error) => {
        addLog("error", "Failed to cancel payment", "scan", "cancelPayment", {
          paymentId,
          error,
        });
        showErrorToast("We couldn't cancel this payment. Try again.");
      });
    }
    resetNavigation("/amount");
  };

  const handleCopyPaymentUrl = async () => {
    await Clipboard.setStringAsync(qrUri);
    showSuccessToast("Payment link copied");
  };

  useEffect(() => {
    if (!deviceId || !amount) return;

    async function initiatePayment() {
      if (!merchantId) {
        addLog(
          "error",
          "Merchant ID is not configured",
          "scan",
          "initiatePayment",
        );
        showErrorToast(
          "Add a merchant ID in Settings before starting a payment.",
        );
        return;
      }

      try {
        const paymentRequest = {
          referenceId: uuidv4().replace(/-/g, ""),
          amount: {
            value: String(amountToCents(amount)),
            unit: currency.unit,
          },
        };

        const data = await startPayment(paymentRequest);

        addLog("info", "Payment started", "scan", "initiatePayment", {
          paymentId: data.paymentId,
          gatewayUrl: data.gatewayUrl,
        });
        setQrUri(data.gatewayUrl);
        setPaymentId(data.paymentId);
        setExpiresAt(data.expiresAt);
      } catch (error: any) {
        addLog(
          "error",
          (error as Error).message || "Unknown error",
          "scan",
          "initiatePayment",
          { error },
        );
        // The below-minimum rejection only carries the floor in its message, so
        // parse it here and keep the raw server string out of the route params.
        const minAmountCents = parseMinAmountCents(error.message);
        if (minAmountCents) {
          onFailure(AMOUNT_TOO_LOW, minAmountCents);
        } else {
          onFailure(error.code);
        }
      }
    }

    initiatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, amount, merchantId]);

  const { data: paymentStatusData } = usePaymentStatus(paymentId, {
    enabled: !!paymentId && !!qrUri,
    onTerminalState: (data) => {
      if (data.status === "succeeded") {
        addLog("info", "Payment completed", "scan", "usePaymentStatus", {
          paymentId,
          data,
        });
        onSuccess();
      } else {
        addLog("error", data.status, "scan", "usePaymentStatus", {
          paymentId,
          data,
        });
        onFailure(data.status);
      }
    },
  });

  const { remainingSeconds, isActive: isCountdownActive } = useCountdown({
    expiresAt,
    onExpired: () => onFailure("expired"),
  });

  // The visible countdown is plain (non-live) text so screen readers don't
  // announce every second. Instead we announce the remaining time only when it
  // crosses these thresholds, giving low-vision users the urgency cue without
  // the per-second chatter.
  const announcedThresholdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    announcedThresholdsRef.current = new Set();
  }, [expiresAt]);
  useEffect(() => {
    if (!isCountdownActive) return;
    const crossed = COUNTDOWN_ANNOUNCE_THRESHOLDS.filter(
      (threshold) => remainingSeconds <= threshold,
    );
    const hasNewCrossing = crossed.some(
      (threshold) => !announcedThresholdsRef.current.has(threshold),
    );
    if (hasNewCrossing) {
      crossed.forEach((threshold) =>
        announcedThresholdsRef.current.add(threshold),
      );
      AccessibilityInfo.announceForAccessibility(
        `Payment expires in ${formatCountdownSpoken(remainingSeconds)}`,
      );
    }
  }, [remainingSeconds, isCountdownActive]);

  const isProcessing = paymentStatusData?.status === "processing";
  const showNfc = isNfcHceEnabled && nfcEnabled && nfcMode === "hce";

  // Hide the header back button (and swipe-back) once the payment leaves the
  // interactive QR state. We derive this from the status rather than binding it
  // to `isProcessing`: a terminal status flips `isProcessing` back to false
  // *and* navigates away in the same tick, and reviving the header back-button
  // config while the screen is detaching crashes react-native-screens on Android
  // with "ScreenStackFragment added into a non-stack container". Keeping it
  // hidden for every status past `requires_action` means the option never flips
  // back during that transition. (Derived value only — a ref/effect latch trips
  // the react-hooks lint rules.)
  const backHidden =
    !!paymentStatusData && paymentStatusData.status !== "requires_action";

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerBackVisible: !backHidden,
          gestureEnabled: !backHidden,
        }}
      />
      {isProcessing ? (
        <View
          style={[
            styles.loadingContainer,
            isTablet && styles.loadingContainerTablet,
          ]}
        >
          <WalletConnectLoading size={isTablet ? 220 : 180} />
          <View style={styles.loadingTextContainer}>
            <ThemedText
              style={{ color: Theme["text-primary"] }}
              fontSize={isTablet ? 24 : 20}
              lineHeight={isTablet ? 26 : 22}
            >
              Waiting for confirmation...
            </ThemedText>
            <ThemedText
              style={{ color: Theme["text-secondary"], textAlign: "center" }}
              fontSize={isTablet ? 20 : 16}
              lineHeight={isTablet ? 22 : 18}
            >
              This usually takes a few seconds. Keep this screen open.
            </ThemedText>
          </View>
        </View>
      ) : (
        <View
          style={[styles.scanContainer, isTablet && styles.scanContainerTablet]}
        >
          <View
            style={[
              styles.header,
              isTablet && styles.headerTablet,
              !showNfc && styles.headerCentered,
            ]}
          >
            {showNfc && (
              <Image
                source={assets?.[1]}
                contentFit="contain"
                style={[
                  styles.nfcIcon,
                  isTablet && styles.nfcIconTablet,
                  { tintColor: Theme["icon-default"] },
                ]}
              />
            )}
            <ThemedText
              style={[
                styles.amountValue,
                isTablet && styles.amountValueTablet,
                { color: Theme["text-primary"], textTransform: "uppercase" },
              ]}
            >
              {formatAmountWithSymbol(amount, currency)}
            </ThemedText>
          </View>

          <ThemedText
            style={[
              styles.instructionText,
              isTablet && styles.instructionTextTablet,
              { color: Theme["text-secondary"] },
            ]}
          >
            {showNfc ? "Scan or tap to pay" : "Scan to pay"}
          </ThemedText>

          <View style={[styles.qrSection, isTablet && styles.qrSectionTablet]}>
            <QRCode
              size={isTablet ? 420 : 300}
              uri={qrUri}
              logoBorderRadius={100}
              onPress={handleCopyPaymentUrl}
              testID="pos-qr-code"
            >
              <Image
                source={assets?.[0]}
                style={[styles.logo, isTablet && styles.logoTablet]}
              />
            </QRCode>
            <View
              accessible={isCountdownActive}
              accessibilityRole="text"
              accessibilityLabel={
                isCountdownActive
                  ? `Payment expires in ${formatCountdownSpoken(remainingSeconds)}`
                  : undefined
              }
              aria-label={
                isCountdownActive
                  ? `Payment expires in ${formatCountdownSpoken(remainingSeconds)}`
                  : undefined
              }
              aria-hidden={!isCountdownActive}
              accessibilityElementsHidden={!isCountdownActive}
              importantForAccessibility={
                isCountdownActive ? "yes" : "no-hide-descendants"
              }
              style={[styles.timerRow, { opacity: isCountdownActive ? 1 : 0 }]}
            >
              <ThemedText
                fontSize={isTablet ? 20 : undefined}
                lineHeight={isTablet ? 22 : undefined}
                style={{ color: Theme["text-secondary"] }}
              >
                Expires in
              </ThemedText>
              <ThemedText
                fontSize={isTablet ? 20 : undefined}
                lineHeight={isTablet ? 22 : undefined}
                style={{
                  color: Theme["bg-accent-primary"],
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatCountdown(remainingSeconds)}
              </ThemedText>
            </View>
          </View>
          <View style={{ flex: 1 }} />
        </View>
      )}
      {!isProcessing && (
        <Button
          type="neutral"
          variant="secondary"
          testID="cancel-button"
          onPress={handleOnCancelPress}
          fullWidth={false}
          size={isTablet ? "lg" : "md"}
          style={[styles.cancelButton, isTablet && styles.cancelButtonTablet]}
        >
          Cancel
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["spacing-6"],
    paddingHorizontal: Spacing["spacing-7"],
  },
  loadingContainerTablet: {
    gap: Spacing["spacing-8"],
    paddingHorizontal: Spacing["spacing-8"],
  },
  scanContainer: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-5"],
    alignItems: "center",
    gap: Spacing["spacing-4"],
  },
  scanContainerTablet: {
    paddingHorizontal: Spacing["spacing-8"],
    paddingVertical: Spacing["spacing-8"],
    gap: Spacing["spacing-5"],
  },
  header: {
    width: "100%",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  headerTablet: {
    gap: Spacing["spacing-5"],
  },
  headerCentered: {
    flex: 1,
    justifyContent: "flex-end",
  },
  loadingTextContainer: {
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  instructionText: {
    fontSize: 18,
    textAlign: "center",
  },
  instructionTextTablet: {
    fontSize: 22,
    lineHeight: 24,
  },
  amountValue: {
    fontFamily: "KH Teka Medium",
    fontSize: 50,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 50,
  },
  amountValueTablet: {
    fontSize: 64,
    lineHeight: 64,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoTablet: {
    width: 104,
    height: 104,
  },
  qrSection: {
    alignItems: "center",
    gap: Spacing["spacing-4"],
  },
  qrSectionTablet: {
    gap: Spacing["spacing-5"],
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["spacing-1"],
  },
  cancelButton: {
    marginHorizontal: Spacing["spacing-5"],
  },
  cancelButtonTablet: {
    marginHorizontal: Spacing["spacing-8"],
  },
  nfcIcon: {
    marginLeft: Spacing["spacing-5"],
    width: 80,
    height: 60,
    marginBottom: Spacing["spacing-3"],
  },
  nfcIconTablet: {
    marginLeft: Spacing["spacing-8"],
    width: 104,
    height: 78,
    marginBottom: Spacing["spacing-5"],
  },
});
