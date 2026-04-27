import { UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useDisableBackButton } from "@/hooks/use-disable-back-button";
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatAmountWithSymbol, getCurrency } from "@/utils/currency";
import { resetNavigation } from "@/utils/navigation";
import { connectPrinter, printReceipt } from "@/utils/printer";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";

interface SuccessParams extends UnknownOutputParams {
  amount: string;
  chainName: string;
  token: string;
  timestamp: string;
  paymentId: string;
  tokenAmount: string;
  tokenDecimals: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const diagonalLength = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
const initialCircleSize = 20;
const finalScale = Math.ceil(diagonalLength / initialCircleSize) + 2;

export default function PaymentSuccessScreen() {
  useDisableBackButton();
  const Theme = useTheme("light");
  const DarkTheme = useTheme("dark");
  const params = useLocalSearchParams<SuccessParams>();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const currencyCode = useSettingsStore((state) => state.currency);
  const currency = getCurrency(currencyCode);
  const getVariantPrinterLogo = useSettingsStore(
    (state) => state.getVariantPrinterLogo,
  );
  const addLog = useLogsStore((state) => state.addLog);
  const { top } = useSafeAreaInsets();
  const { amount } = params;
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const isPrintingRef = useRef(false);

  const circleScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  const handleNewPayment = () => {
    resetNavigation("/amount");
  };

  const handlePrintReceipt = async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;
    setIsPrinting(true);
    try {
      await printReceipt({
        txnId: params.paymentId,
        amountFiat: Number(amount),
        currency,
        tokenSymbol: params.token,
        tokenAmount: params.tokenAmount,
        tokenDecimals: params.tokenDecimals
          ? Number(params.tokenDecimals)
          : undefined,
        networkName: params.chainName,
        date: params.timestamp,
        logoBase64: getVariantPrinterLogo(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addLog("error", errorMessage, "payment-success", "handlePrintReceipt");
    } finally {
      isPrintingRef.current = false;
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initPrinter = async () => {
      try {
        const { connected, error } = await connectPrinter();
        if (isMounted) {
          setIsPrinterConnected(connected);
          if (!connected && error) {
            addLog("error", error, "payment-success", "initPrinter");
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          addLog("error", errorMessage, "payment-success", "initPrinter");
          setIsPrinterConnected(false);
        }
      }
    };

    initPrinter();

    return () => {
      isMounted = false;
    };
  }, [addLog]);

  useEffect(() => {
    circleScale.value = withTiming(finalScale, {
      duration: 400,
    });
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Expanding circle background */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: Theme["bg-payment-success"],
            width: initialCircleSize,
            height: initialCircleSize,
            borderRadius: initialCircleSize / 2,
          },
          circleAnimatedStyle,
        ]}
      />

      {/* Content that fades in after circle expands */}
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <View
          testID="pos-payment-success"
          nativeID="pos-payment-success"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText
            style={[
              styles.amountDescription,
              { color: Theme["text-payment-success"] },
            ]}
          >
            Payment successful
          </ThemedText>
          <ThemedText
            style={[
              styles.amountValue,
              { color: Theme["text-payment-success"] },
            ]}
          >
            {formatAmountWithSymbol(amount, currency)}
          </ThemedText>
        </View>
        <View style={styles.buttonContainer}>
          {isPrinterConnected && (
            <Button
              onPress={handlePrintReceipt}
              disabled={isPrinting}
              style={[
                styles.button,
                {
                  backgroundColor: DarkTheme["foreground-primary"],
                  opacity: isPrinting ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.buttonText,
                  { color: DarkTheme["text-primary"] },
                ]}
              >
                {isPrinting ? "Printing..." : "Print receipt"}
              </ThemedText>
              <Image
                source={require("@/assets/images/receipt.png")}
                style={styles.buttonIcon}
                tintColor={DarkTheme["icon-default"]}
              />
            </Button>
          )}

          <Button
            style={[
              styles.button,
              {
                backgroundColor: DarkTheme["foreground-primary"],
              },
            ]}
            onPress={handleNewPayment}
          >
            <ThemedText
              style={[styles.buttonText, { color: DarkTheme["text-primary"] }]}
            >
              New payment
            </ThemedText>
            <Image
              source={require("@/assets/images/plus.png")}
              style={styles.buttonIcon}
              tintColor={DarkTheme["icon-default"]}
            />
          </Button>
        </View>
      </Animated.View>
      <StatusBar style={themeMode === "system" ? "auto" : themeMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-5"],
  },
  circle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -initialCircleSize / 2,
    marginTop: -initialCircleSize / 2,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  amountDescription: {
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  amountValue: {
    fontSize: 38,
    lineHeight: 38,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-5"],
    borderRadius: BorderRadius["5"],
    gap: Spacing["spacing-2"],
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 18,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});
