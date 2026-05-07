import { CloseButton } from "@/components/close-button";
import QRCode from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { BorderRadius, Spacing } from "@/constants/spacing";
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
import {
  router,
  Stack,
  UnknownOutputParams,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  splitIndex: string;
  splitCount: string;
  splitTotalAmount: string;
  splitPaymentIds: string;
}

export default function ScanScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([
    require("@/assets/images/wc_logo_dark.png"),
    require("@/assets/images/nfc.png"),
  ]);

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

  const { amount, splitIndex, splitCount, splitTotalAmount, splitPaymentIds } =
    params;
  const splitIndexNum = splitIndex ? Number(splitIndex) : undefined;
  const splitCountNum = splitCount ? Number(splitCount) : undefined;
  const isSplit = !!splitIndexNum && !!splitCountNum;
  const isMidSplit = isSplit && splitIndexNum > 1;

  const { isNfcActive, nfcMode } = useNfcPayment({
    paymentUrl: qrUri,
    enabled: nfcEnabled,
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
        ...(isSplit && {
          splitIndex,
          splitCount,
          splitTotalAmount,
          splitPaymentIds,
        }),
      },
    });
  }, [
    paymentId,
    amount,
    isSplit,
    splitIndex,
    splitCount,
    splitTotalAmount,
    splitPaymentIds,
  ]);

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
          ...(isSplit && {
            splitIndex,
            splitCount,
            splitTotalAmount,
            splitPaymentIds,
          }),
        },
      });
    },
    [
      amount,
      isSplit,
      splitIndex,
      splitCount,
      splitTotalAmount,
      splitPaymentIds,
    ],
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
  // const showNfc = nfcEnabled && nfcMode === "hce";
  const showNfc = "true";
  const nfcIconTint = isNfcActive ? Theme["icon-invert"] : Theme["icon-invert"];

  return (
    <View style={styles.container}>
      {isMidSplit && (
        <Stack.Screen
          options={{
            headerBackVisible: false,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
      )}
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
          {isSplit && splitCountNum && splitIndexNum && (
            <View style={styles.splitStepper}>
              <View style={styles.stepperRow}>
                {Array.from({ length: splitCountNum }).map((_, i) => {
                  const step = i + 1;
                  const isCompleted = step < splitIndexNum;
                  const isCurrent = step === splitIndexNum;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.stepperSegment,
                        {
                          backgroundColor:
                            isCompleted || isCurrent
                              ? Theme["bg-accent-primary"]
                              : Theme["foreground-primary"],
                          opacity: isCurrent ? 0.4 : 1,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <ThemedText
                style={[
                  styles.stepperLabel,
                  { color: Theme["bg-accent-primary"] },
                ]}
                fontSize={14}
                lineHeight={16}
              >
                Payment {splitIndexNum} of {splitCountNum}
              </ThemedText>
            </View>
          )}
          <View style={[styles.header, !showNfc && styles.headerCentered]}>
            {showNfc && (
              <Image
                source={assets?.[1]}
                style={[styles.nfcIcon, { tintColor: nfcIconTint }]}
                tintColor={nfcIconTint}
              />
            )}
            <ThemedText
              style={[
                styles.amountValue,
                { color: Theme["text-primary"], textTransform: "uppercase" },
              ]}
            >
              {formatAmountWithSymbol(amount, currency)}
            </ThemedText>
            <ThemedText
              style={[
                styles.instructionText,
                { color: Theme["text-secondary"] },
              ]}
            >
              {showNfc ? "Scan or tap your wallet to pay" : "Scan to pay"}
            </ThemedText>
          </View>

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
                Expires in
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
          {!isMidSplit && (
            <CloseButton
              style={styles.closeButton}
              onPress={handleOnClosePress}
            />
          )}
        </View>
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
  headerCentered: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: Spacing["spacing-7"],
  },
  amountText: {
    fontSize: 16,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 18,
    textAlign: "center",
  },
  amountValue: {
    fontFamily: "KH Teka Medium",
    fontSize: 50,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 50,
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
  nfcIcon: {
    width: 71,
    height: 42,
    marginBottom: Spacing["spacing-3"],
  },
  splitStepper: {
    width: "100%",
    alignItems: "center",
    gap: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-3"],
  },
  stepperRow: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing["spacing-2"],
  },
  stepperSegment: {
    flex: 1,
    height: 11,
    borderRadius: BorderRadius[2],
  },
  stepperLabel: {
    textAlign: "center",
  },
});
