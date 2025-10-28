import WCLogo from "@/assets/images/wc-logo.png";
import PaymentStep from "@/components/payment-step";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { usePOS } from "@/context/POSContext";
import { usePOSListener } from "@/hooks/use-pos-listener";
import { useTheme } from "@/hooks/use-theme-color";
import {
  getNetworkByCaipId,
  getNetworkByName,
  TokenKey,
} from "@/utils/networks";
import { showErrorToast } from "@/utils/toast";
import * as Haptics from "expo-haptics";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  token: TokenKey;
  networkName: string;
  recipientAddress: string;
}

export default function QRModalScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPaymentRequested, setIsPaymentRequested] = useState(false);
  const [isPaymentBroadcasted, setIsPaymentBroadcasted] = useState(false);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isPaymentRejected, setIsPaymentRejected] = useState(false);
  const [isConnectionFailed, setIsConnectionFailed] = useState(false);

  const [qrUri, setQrUri] = useState("");
  const { posClient } = usePOS();
  const Theme = useTheme();

  // Extract data from URL parameters
  const { amount, token, networkName, recipientAddress } = params;

  usePOSListener("connected", ({ session }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log("Connected to wallet", session);

    // Disable deep link redirections
    const updatedSession = {
      ...session,
      sessionConfig: {
        disableDeepLink: true,
      },
    };

    posClient?.engine.signClient.session.set(session.topic, updatedSession);
    setIsWalletConnected(true);
  });

  usePOSListener("disconnected", () => {
    console.log("Disconnected from wallet");
  });

  usePOSListener("connection_failed", ({ error }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsConnectionFailed(true);
    console.log("Connection failed", error);
    showErrorToast({ title: "Connection failed", message: error?.message });
  });

  usePOSListener("connection_rejected", ({ error }) => {
    setIsConnectionFailed(true);
    console.log("Connection rejected", error);
    showErrorToast({ title: "Connection rejected", message: error?.message });
    posClient?.restart();
  });

  usePOSListener("qr_ready", async ({ uri }) => {
    console.log("QR ready");
    setQrUri(uri);
  });

  usePOSListener("payment_requested", () => {
    console.log("Payment requested");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPaymentRequested(true);
  });

  usePOSListener("payment_rejected", ({ error }) => {
    console.log("Payment rejected", error);
    showErrorToast({ title: "Payment rejected", message: error?.message });
    setIsPaymentRejected(true);
  });

  usePOSListener("payment_broadcasted", () => {
    console.log("Payment broadcasted");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPaymentBroadcasted(true);
  });

  usePOSListener("payment_failed", ({ error }) => {
    console.log("Payment failed", error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    showErrorToast({ title: "Payment failed", message: error?.message });
    setIsPaymentFailed(true);
  });

  usePOSListener("payment_successful", ({ transaction, result }) => {
    console.log("Payment successful");
    setIsPaymentSuccessful(true);

    const networkData = getNetworkByCaipId(transaction.chainId);

    const explorerUrl = networkData?.blockExplorers?.default?.url;
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

  const requestPayment = async () => {
    setIsConnectionFailed(false);
    setIsPaymentRequested(false);
    setIsPaymentBroadcasted(false);
    setIsPaymentFailed(false);
    setIsPaymentSuccessful(false);
    setIsPaymentRejected(false);
    setIsWalletConnected(false);
    posClient?.restart();
  };

  useEffect(() => {
    const networkData = getNetworkByName(networkName);

    if (!networkData) {
      showErrorToast({
        title: "Network not found",
        message: "Please select another network",
      });
      return;
    }

    const tokenData = networkData.tokens[token];

    const paymentIntent = {
      token: {
        network: { name: networkData.name, chainId: networkData.caipNetworkId },
        symbol: tokenData.symbol,
        standard: tokenData.standard,
        address: tokenData.address,
      },
      amount,
      recipient: `${networkData.caipNetworkId}:${recipientAddress}`,
    };

    posClient?.createPaymentIntent({ paymentIntents: [paymentIntent] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={styles.container}>
      {qrUri ? (
        <ThemedView style={styles.content}>
          <ThemedView
            style={[
              styles.qrContainer,
              {
                backgroundColor: Theme.white,
                shadowColor: Theme.cardShadow,
              },
            ]}
          >
            <QRCode
              value={qrUri}
              size={Math.min(Dimensions.get("window").width * 0.65, 350)}
              color="#000000"
              backgroundColor="#FFFFFF"
              logo={WCLogo}
              logoSize={60}
            />
          </ThemedView>
          <ThemedView
            style={[
              styles.recipientContainer,
              { backgroundColor: Theme.cardBackground },
            ]}
          >
            <ThemedText style={[{ color: Theme.text }]}>
              Recipient: {recipientAddress.slice(0, 6)}...
              {recipientAddress.slice(-4)}
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.amountContainer,
              { backgroundColor: Theme.cardBackground },
            ]}
          >
            <ThemedText
              style={[
                styles.amountText,
                { color: Theme.text, textTransform: "uppercase" },
              ]}
            >
              ${amount} {token?.toUpperCase()}
            </ThemedText>
            <ThemedText
              style={[
                styles.amountTextSecondary,
                { color: Theme.text, textTransform: "capitalize" },
              ]}
            >
              {networkName}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusContainer}>
            <PaymentStep
              isCompleted={isWalletConnected}
              isError={isConnectionFailed}
              text="Scan QR - Waiting for wallet connection"
            />
            <PaymentStep
              isCompleted={isPaymentRequested}
              isError={isPaymentFailed}
              text="Sending transaction"
            />
            <PaymentStep
              isCompleted={isPaymentBroadcasted}
              isError={isPaymentFailed || isPaymentRejected}
              text="Confirming transaction"
            />
            <PaymentStep
              isCompleted={isPaymentSuccessful}
              isError={isPaymentFailed || isPaymentRejected}
              text="Payment successful"
            />
          </ThemedView>
          {isConnectionFailed || isPaymentFailed || isPaymentRejected ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                { backgroundColor: Theme.cardBackground },
              ]}
              onPress={requestPayment}
            >
              <ThemedText style={styles.actionButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      ) : (
        <>
          <ThemedView style={[styles.content, { justifyContent: "center" }]}>
            <ActivityIndicator size="large" color={Theme.text} />
            <ThemedText>Generating QR Code...</ThemedText>
          </ThemedView>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  recipientContainer: {
    marginVertical: 8,
    borderRadius: 14,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  amountContainer: {
    borderRadius: 18,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  amountTextSecondary: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  statusContainer: {
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    marginTop: 10,
    minWidth: 150,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
