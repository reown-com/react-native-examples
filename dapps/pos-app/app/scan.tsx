import { CloseButton } from "@/components/close-button";
import { QRCode } from "@/components/qr-code";
import { ThemedText } from "@/components/themed-text";
import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePOS } from "@/context/POSContext";
import { usePOSListener } from "@/hooks/use-pos-listener";
import { useTheme } from "@/hooks/use-theme-color";
import { resetNavigation } from "@/utils/navigation";
import { getNetworkByCaipId, getTokenById, TokenKey } from "@/utils/networks";
import { showErrorToast } from "@/utils/toast";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  token: TokenKey;
  networkCaipId: string;
  recipientAddress: string;
}

export default function QRModalScreen() {
  const params = useLocalSearchParams<ScreenParams>();

  const [qrUri, setQrUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(false);
  }, [amount, token, networkCaipId, recipientAddress]);

  usePOSListener("connection_failed", ({ error }) => {
    onFailure();
  });

  usePOSListener("connection_rejected", ({ error }) => {
    onFailure();
  });

  usePOSListener("qr_ready", async ({ uri }) => {
    setQrUri(uri);
  });

  usePOSListener("connected", () => {
    setIsLoading(true);
  });

  usePOSListener("payment_rejected", ({ error }) => {
    onFailure();
  });

  usePOSListener("payment_failed", ({ error }) => {
    onFailure();
  });

  usePOSListener("payment_successful", ({ transaction, result }) => {
    const _networkData = getNetworkByCaipId(transaction.chainId);

    const explorerUrl = _networkData?.blockExplorers?.default?.url;
    const explorerLink = explorerUrl
      ? `${explorerUrl}/tx/${result}`
      : undefined;

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
    setIsLoading(false);
  });

  const handleOnClosePress = () => {
    resetNavigation("/amount");
  };

  useEffect(() => {
    const _networkData = getNetworkByCaipId(networkCaipId);

    if (!_networkData) {
      showErrorToast("Network not found");
      return;
    }

    const tokenStandard = tokenData?.standard[networkCaipId];
    const tokenAddress = tokenData?.addresses[networkCaipId];

    if (!tokenData || !tokenStandard || !tokenAddress) {
      showErrorToast("Token not found");
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
          <QRCode size={300} uri={qrUri} logoBorderRadius={55}>
            <ImageBackground
              source={tokenData?.icon}
              style={styles.tokenIcon}
              resizeMode="contain"
            >
              <Image
                source={networkData?.icon}
                style={[styles.chainIcon, { borderColor: Theme["bg-primary"] }]}
                cachePolicy="memory-disk"
                priority="high"
              />
            </ImageBackground>
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
    alignSelf: "center",
  },
});
