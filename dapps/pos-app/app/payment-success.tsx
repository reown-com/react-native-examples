import { UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import HeaderImage from "@/components/header-image";
import { SuccessAnimation } from "@/components/success-animation";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useDisableBackButton } from "@/hooks/use-disable-back-button";
import { useTheme } from "@/hooks/use-theme-color";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatAmountWithSymbol, getCurrency } from "@/utils/currency";
import { buildReceiptLogo } from "@/utils/build-receipt-logo";
import { resetNavigation } from "@/utils/navigation";
import { connectPrinter, printReceipt } from "@/utils/printer";
import { Image } from "expo-image";

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
const finalScale = Math.ceil(diagonalLength / initialCircleSize) + 4;
const contentOffset = 16;
const contentRevealDelay = 700;
const contentRevealDuration = 200;

export default function PaymentSuccessScreen() {
  useDisableBackButton();
  const Theme = useTheme();
  const params = useLocalSearchParams<SuccessParams>();

  const currencyCode = useSettingsStore((state) => state.currency);
  const variant = useSettingsStore((state) => state.variant);
  const getVariantPrinterLogo = useSettingsStore(
    (state) => state.getVariantPrinterLogo,
  );
  const currency = getCurrency(currencyCode);
  const addLog = useLogsStore((state) => state.addLog);
  const { top, bottom } = useSafeAreaInsets();
  const { amount } = params;
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSuccessAnimationVisible, setIsSuccessAnimationVisible] =
    useState(false);
  const isPrintingRef = useRef(false);
  const bottomSpacing = Math.max(
    bottom + Spacing["spacing-3"],
    Spacing["spacing-7"],
  );

  const circleScale = useSharedValue(1);
  const backgroundOverlayOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(contentOffset);

  const handleNewPayment = () => {
    resetNavigation("/amount");
  };

  const handlePrintReceipt = async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;
    setIsPrinting(true);
    try {
      // Build the header lockup (wpay + "+" + partner logo) from the live
      // assets; fall back to the pre-built logo if Skia rendering fails.
      const logoBase64 =
        (await buildReceiptLogo(variant)) ?? getVariantPrinterLogo();
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
        logoBase64,
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
    circleScale.value = withTiming(finalScale, { duration: 400 });
    backgroundOverlayOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 300 }),
    );
    contentOpacity.value = withDelay(
      contentRevealDelay,
      withTiming(1, { duration: contentRevealDuration }),
    );
    contentTranslateY.value = withDelay(
      contentRevealDelay,
      withTiming(0, { duration: contentRevealDuration }),
    );
    const revealTimeout = setTimeout(() => {
      setIsSuccessAnimationVisible(true);
    }, contentRevealDelay);

    return () => {
      clearTimeout(revealTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const backgroundOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOverlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Expanding circle background */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: Theme["bg-accent-primary"],
            width: initialCircleSize,
            height: initialCircleSize,
            borderRadius: initialCircleSize / 2,
          },
          circleAnimatedStyle,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.backgroundOverlay,
          { backgroundColor: Theme["bg-primary"] },
          backgroundOverlayAnimatedStyle,
        ]}
      />

      {/* Content fades in after the blue-to-theme transition completes. The
          safe-area padding lives here (not on the full-screen container) so the
          expanding circle stays centered on the true screen center. */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            paddingTop: top + Spacing["spacing-3"],
            paddingBottom: bottomSpacing,
          },
          contentAnimatedStyle,
        ]}
      >
        <View style={styles.header}>
          <HeaderImage tintColor={Theme["text-primary"]} />
        </View>
        <View
          testID="pos-payment-success"
          nativeID="pos-payment-success"
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: Spacing["spacing-2"],
          }}
        >
          <View style={styles.successAnimationContainer}>
            {isSuccessAnimationVisible && (
              <SuccessAnimation width={200} height={175} />
            )}
          </View>
          <ThemedText
            fontSize={38}
            lineHeight={38}
            style={[styles.amountValue, { color: Theme["text-primary"] }]}
          >
            {formatAmountWithSymbol(amount, currency)}
          </ThemedText>
          <ThemedText
            fontSize={18}
            lineHeight={20}
            style={[styles.amountDescription, { color: Theme["text-primary"] }]}
          >
            Payment successful
          </ThemedText>
        </View>
        <View style={styles.buttonContainer}>
          {isPrinterConnected && (
            <Button
              type="neutral"
              variant="tertiary"
              onPress={handlePrintReceipt}
              disabled={isPrinting}
              icon={
                <Image
                  source={require("@/assets/images/receipt.png")}
                  style={styles.buttonIcon}
                  tintColor={Theme["bg-primary"]}
                />
              }
            >
              {isPrinting ? "Printing receipt…" : "Print receipt"}
            </Button>
          )}

          <Button type="accent" variant="primary" onPress={handleNewPayment}>
            Start new payment
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -initialCircleSize / 2,
    marginTop: -initialCircleSize / 2,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFill,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing["spacing-5"],
  },
  header: {
    alignItems: "center",
    paddingBottom: Spacing["spacing-4"],
  },
  successAnimationContainer: {
    width: 200,
    height: 175,
  },
  amountDescription: {
    textAlign: "center",
  },
  amountValue: {
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});
