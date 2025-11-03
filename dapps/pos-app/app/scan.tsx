import { CloseButton } from "@/components/close-button";
import { QRCode } from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePOS } from "@/context/POSContext";
import { usePOSListener } from "@/hooks/use-pos-listener";
import { useTheme } from "@/hooks/use-theme-color";
import { getNetworkByCaipId, getTokenById, TokenKey } from "@/utils/networks";
import { showErrorToast } from "@/utils/toast";
import * as Haptics from "expo-haptics";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  token: TokenKey;
  networkCaipId: string;
  recipientAddress: string;
}

export default function QRModalScreen() {
  const params = useLocalSearchParams<ScreenParams>();

  const [qrUri, setQrUri] = useState("");
  const { posClient } = usePOS();
  const Theme = useTheme();

  const { amount, token, networkCaipId, recipientAddress } = params;

  const networkData = getNetworkByCaipId(networkCaipId);
  const tokenData = getTokenById(token);

  const onFailure = useCallback(() => {
    router.dismiss();
    router.replace({
      pathname: "/payment-failure",
      params: {
        amount,
        token,
        networkCaipId,
        recipientAddress,
      },
    });
  }, [amount, token, networkCaipId, recipientAddress]);

  usePOSListener("connected", ({ session }) => {
    console.log("Connected to wallet", session);
  });

  usePOSListener("disconnected", () => {
    console.log("Disconnected from wallet");
  });

  usePOSListener("connection_failed", ({ error }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.log("Connection failed", error);
    onFailure();
  });

  usePOSListener("connection_rejected", ({ error }) => {
    console.log("Connection rejected", error);
    onFailure();
  });

  usePOSListener("qr_ready", async ({ uri }) => {
    console.log("QR ready");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setQrUri(uri);
  });

  usePOSListener("payment_requested", () => {
    console.log("Payment requested");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  });

  usePOSListener("payment_rejected", ({ error }) => {
    console.log("Payment rejected", error);
    onFailure();
  });

  usePOSListener("payment_broadcasted", () => {
    console.log("Payment broadcasted");
  });

  usePOSListener("payment_failed", ({ error }) => {
    console.log("Payment failed", error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onFailure();
  });

  usePOSListener("payment_successful", ({ transaction, result }) => {
    console.log("Payment successful");

    const _networkData = getNetworkByCaipId(transaction.chainId);

    const explorerUrl = _networkData?.blockExplorers?.default?.url;
    const explorerLink = explorerUrl
      ? `${explorerUrl}/tx/${result}`
      : undefined;

    router.dismiss();
    router.replace({
      pathname: "/payment-success",
      params: {
        transactionHash: result,
        explorerLink: explorerLink,
        network: networkData?.name || "Unknown",
        amount: amount,
        token: token,
        recipientAddress: recipientAddress,
      },
    });
  });

  const handleOnClosePress = () => {
    router.dismissAll();
    router.navigate("/amount");
  };

  useEffect(() => {
    const _networkData = getNetworkByCaipId(networkCaipId);

    if (!_networkData) {
      showErrorToast({
        title: "Network not found",
        message: "Please select another network",
      });
      return;
    }

    const tokenStandard = tokenData?.standard[networkCaipId];
    const tokenAddress = tokenData?.addresses[networkCaipId];

    if (!tokenData || !tokenStandard || !tokenAddress) {
      showErrorToast({
        title: "Token not found",
        message: "Please select another token",
      });
      return;
    }

    const paymentIntent = {
      token: {
        network: {
          name: _networkData.name,
          chainId: _networkData.caipNetworkId,
        },
        symbol: tokenData.symbol,
        standard: tokenStandard,
        address: tokenAddress,
      },
      amount,
      recipient: `${_networkData.caipNetworkId}:${recipientAddress}`,
    };

    posClient?.createPaymentIntent({ paymentIntents: [paymentIntent] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.amountContainer}>
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
      </ThemedView>
      <QRCode size={300} uri={qrUri} style={{ flex: 2 }}>
        <ImageBackground
          source={tokenData?.icon as ImageSourcePropType}
          style={styles.tokenIcon}
          resizeMode="contain"
        >
          <Image
            source={networkData?.icon as ImageSourcePropType}
            style={[styles.chainIcon, { borderColor: Theme["bg-primary"] }]}
            resizeMode="contain"
          />
        </ImageBackground>
      </QRCode>
      <View style={{ flex: 1 }} />
      <CloseButton style={styles.closeButton} onPress={handleOnClosePress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    // marginBottom: Spacing["spacing-8"],
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
  tokenIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius["5"],
  },
  chainIcon: {
    width: 40,
    height: 40,
    borderWidth: 4,
    borderRadius: BorderRadius["5"],
    bottom: -2,
    right: -2,
    position: "absolute",
  },
  closeButton: {
    position: "absolute",
    bottom: Spacing["spacing-2"],
  },
});
