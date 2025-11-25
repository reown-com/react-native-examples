import { usePaymentStatus } from "@/api/hooks";
import { startPayment } from "@/api/payment";
import { CloseButton } from "@/components/close-button";
import { QRCode } from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { resetNavigation } from "@/utils/navigation";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
}

export default function QRModalScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [assets] = useAssets([require("@/assets/images/wc_logo_blue.png")]);

  const [qrUri, setQrUri] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { deviceId } = useSettingsStore((state) => state);
  const Theme = useTheme();

  const { amount } = params;

  const onSuccess = useCallback(() => {
    router.dismiss();
    router.replace({
      pathname: "/payment-success",
      params: {
        amount,
      },
    });
  }, [amount]);

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

  useEffect(() => {
    if (!deviceId || !amount) return;

    async function initiatePayment() {
      setIsLoading(true);
      try {
        const paymentRequest = {
          merchantId: deviceId,
          refId: uuidv4(),
          amount: Number(amount) * 100, // amount in cents i.e. $1 = 100
          currency: "USD",
        };

        const data = await startPayment(paymentRequest);
        const url = `${process.env.EXPO_PUBLIC_GATEWAY_URL}/${data.paymentId}`;
        setQrUri(url);
        setPaymentId(data.paymentId);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to start payment:", error);
        setIsLoading(false);
        onFailure();
      }
    }

    initiatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, amount]);

  // Poll payment status once paymentId is available
  usePaymentStatus(paymentId, {
    enabled: !!paymentId && !isLoading,
    onTerminalState: (data) => {
      if (data.status === "ok") {
        onSuccess();
      } else if (data.status === "error") {
        onFailure(data.error);
      }
    },
  });

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <WalletConnectLoading size={180} />
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
          <QRCode size={300} uri={qrUri} logoBorderRadius={100}>
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
