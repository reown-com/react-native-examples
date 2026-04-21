import { CloseButton } from "@/components/close-button";
import { NfcTapIcon } from "@/components/nfc-tap-icon";
import QRCode from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { Spacing } from "@/constants/spacing";
import { useCountdown } from "@/hooks/use-countdown";
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
import { formatCountdown } from "@/utils/misc";
import { resetNavigation } from "@/utils/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useAssets } from "expo-asset";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
}

export default function ScanScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([require("@/assets/images/wc_logo_dark.png")]);

  const [qrUri, setQrUri] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const hasNavigatedRef = useRef(false);

  const {
    deviceId,
    merchantId,
    currency: currencyCode,
    nfcEnabled,
  } = useSettingsStore((state) => state);
  const currency = getCurrency(currencyCode);
  const addLog = useLogsStore((state) => state.addLog);
  const Theme = useTheme();

  const { amount } = params;

  const { isNfcActive, nfcMode } = useNfcPayment({
    paymentUrl: qrUri,
    enabled: nfcEnabled,
    onNfcReady: () => {
      addLog("info", "NFC HCE activated", "scan", "useNfcPayment", {
        paymentUrl: qrUri,
      });
    },
    onNfcError: (error) => {
      addLog("error", error.message, "scan", "useNfcPayment", { error });
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
    (errorCode?: string) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      router.dismiss();
      router.replace({
        pathname: "/payment-failure",
        params: {
          amount,
          ...(errorCode && { errorCode }),
        },
      });
    },
    [amount],
  );

  const handleOnClosePress = () => {
    if (paymentId && paymentStatusData?.status === "requires_action") {
      cancelPayment(paymentId).catch((error) => {
        addLog("error", "Failed to cancel payment", "scan", "cancelPayment", {
          paymentId,
          error,
        });
        showErrorToast("Failed to cancel payment");
      });
    }
    resetNavigation("/amount");
  };

  const handleCopyPaymentUrl = async () => {
    await Clipboard.setStringAsync(qrUri);
    showSuccessToast("Payment URL copied");
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
        showErrorToast("Merchant ID is not configured");
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
        onFailure(error.code);
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

  const isProcessing = paymentStatusData?.status === "processing";
  const showNfc = nfcMode === "hce" && isNfcActive;

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <WalletConnectLoading size={180} />
          <ThemedText
            style={[styles.amountText, { color: Theme["text-primary"] }]}
            fontSize={16}
            lineHeight={18}
          >
            Waiting for payment confirmation…
          </ThemedText>
        </View>
      ) : (
        <View style={styles.scanContainer}>
          <View style={styles.header}>
            {showNfc ? (
              <>
                <NfcTapIcon
                  size={56}
                  background={Theme["bg-accent-primary"]}
                  foreground={Theme["text-invert"]}
                />
                <ThemedText
                  style={[styles.instructionText, { color: Theme["text-tertiary"] }]}
                >
                  Open your wallet app and tap
                </ThemedText>
              </>
            ) : (
              <ThemedText
                style={[styles.instructionText, { color: Theme["text-tertiary"] }]}
              >
                Scan to pay
              </ThemedText>
            )}
            <ThemedText
              style={[
                styles.amountValue,
                { color: Theme["text-primary"], textTransform: "uppercase" },
              ]}
            >
              {formatAmountWithSymbol(amount, currency)}
            </ThemedText>
          </View>

          {showNfc && (
            <View style={styles.divider}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: Theme["foreground-tertiary"] },
                ]}
              />
              <ThemedText
                style={[styles.dividerText, { color: Theme["text-tertiary"] }]}
              >
                Or scan the QR code
              </ThemedText>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: Theme["foreground-tertiary"] },
                ]}
              />
            </View>
          )}

          <View style={styles.qrSection}>
            <QRCode
              size={300}
              uri={qrUri}
              logoBorderRadius={100}
              onPress={handleCopyPaymentUrl}
              testID="pos-qr-code"
            >
              <Image source={assets?.[0]} style={styles.logo} />
            </QRCode>
            <View
              aria-hidden={!isCountdownActive}
              style={[styles.timerRow, { opacity: isCountdownActive ? 1 : 0 }]}
            >
              <ThemedText style={{ color: Theme["text-secondary"] }}>
                Payment expires in
              </ThemedText>
              <ThemedText
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
      <CloseButton style={styles.closeButton} onPress={handleOnClosePress} />
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
    paddingHorizontal: Spacing["spacing-5"],
  },
  scanContainer: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-5"],
    alignItems: "center",
    gap: Spacing["spacing-4"],
  },
  header: {
    width: "100%",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  amountText: {
    fontSize: 16,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
  },
  amountValue: {
    fontFamily: "KH Teka Medium",
    fontSize: 50,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 50,
  },
  divider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 14,
  },
  logo: {
    width: 80,
    height: 80,
  },
  qrSection: {
    alignItems: "center",
    gap: Spacing["spacing-4"],
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["spacing-1"],
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
