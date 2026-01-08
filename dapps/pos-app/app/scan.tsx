import { CloseButton } from "@/components/close-button";
import QRCode from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { usePaymentStatus } from "@/services/hooks";
import { startPayment } from "@/services/payment";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { dollarsToCents } from "@/utils/currency";
import { resetNavigation } from "@/utils/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useAssets } from "expo-asset";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
}

export default function ScanScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([require("@/assets/images/wc_logo_blue.png")]);

  const [qrUri, setQrUri] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const { deviceId, merchantId } = useSettingsStore((state) => state);
  const addLog = useLogsStore((state) => state.addLog);
  const Theme = useTheme();

  const { amount } = params;

  const onSuccess = useCallback(() => {
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
            value: String(dollarsToCents(amount)),
            unit: "iso4217/USD",
          },
        };

        const data = await startPayment(paymentRequest);

        if (process.env.EXPO_PUBLIC_GATEWAY_URL) {
          const url = `${process.env.EXPO_PUBLIC_GATEWAY_URL}/?pid=${data.paymentId}`;

          addLog("info", "Payment started", "scan", "initiatePayment", {
            paymentId: data.paymentId,
            gatewayUrl: url,
          });
          setQrUri(url);
          setPaymentId(data.paymentId);
        } else {
          addLog(
            "error",
            "Gateway URL is not configured",
            "scan",
            "initiatePayment",
          );
          showErrorToast("Gateway URL is not configured");
        }
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
      } else if (data.status === "failed" || data.status === "expired") {
        addLog("error", data.status, "scan", "usePaymentStatus", {
          paymentId,
          data,
        });
        onFailure(data.status);
      }
    },
  });

  const isProcessing = paymentStatusData?.status === "processing";

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
          <View style={styles.amountContainer}>
            <ThemedText
              style={[styles.amountText, { color: Theme["text-tertiary"] }]}
            >
              Scan to pay
            </ThemedText>
            <ThemedText
              style={[
                styles.amountValue,
                { color: Theme["text-primary"], textTransform: "uppercase" },
              ]}
            >
              ${amount}
            </ThemedText>
          </View>
          <QRCode
            size={300}
            uri={qrUri}
            logoBorderRadius={100}
            onPress={handleCopyPaymentUrl}
          >
            <Image source={assets?.[0]} style={styles.logo} />
          </QRCode>
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
    justifyContent: "space-between",
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 6,
    width: 280,
    height: 280,
  },
  amountContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["spacing-2"],
  },
  amountText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  amountValue: {
    fontSize: 38,
    textAlign: "center",
    lineHeight: 36,
  },
  logo: {
    width: 80,
    height: 80,
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
