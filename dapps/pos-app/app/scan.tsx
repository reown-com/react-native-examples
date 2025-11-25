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
  const [isLoading, setIsLoading] = useState(false);
  const { deviceId } = useSettingsStore((state) => state);
  const Theme = useTheme();

  const { amount } = params;

  const onFailure = useCallback(() => {
    router.dismiss();
    router.replace({
      pathname: "/payment-failure",
      params: {
        amount,
      },
    });
    setIsLoading(false);
  }, [amount]);

  const handleOnClosePress = () => {
    resetNavigation("/amount");
  };

  useEffect(() => {
    async function startPayment() {
      const paymentIntent = {
        merchantId: deviceId,
        refId: uuidv4(),
        amount: Number(amount) * 100, // amount in cents i.e. $1 = 100
        currency: "USD",
      };

      console.log(JSON.stringify(paymentIntent));
      //TODO: create types + move api calls to a separate file
      const response = await fetch(
        "https://pay-mvp-core-worker.walletconnect-v1-bridge.workers.dev/start",
        {
          method: "POST",
          body: JSON.stringify(paymentIntent),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log(response);

      // await new Promise((resolve) => setTimeout(resolve, 500));
      // const response = {
      //   ok: true,
      //   data: {
      //     paymentId: "1234567890",
      //   },
      // };

      if (!response.ok) {
        throw new Error("Failed to start payment");
      }

      const data = await response.json();

      // const data = await response.json();
      // console.log(data);
      const url = `https://gateway-wc.vercel.app/v1/${data.paymentId}`;
      setQrUri(url);
    }

    startPayment();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
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
