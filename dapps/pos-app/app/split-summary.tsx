import { UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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
import {
  amountToCents,
  formatAmountWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { resetNavigation } from "@/utils/navigation";
import { connectPrinter, printSplitSummaryReceipt } from "@/utils/printer";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";

interface SplitSummaryParams extends UnknownOutputParams {
  splitCount: string;
  paymentIds: string;
  perPersonAmount: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const diagonalLength = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
const initialCircleSize = 20;
const finalScale = Math.ceil(diagonalLength / initialCircleSize) + 2;

const truncateId = (id: string): string =>
  id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;

export default function SplitSummaryScreen() {
  useDisableBackButton();
  const Theme = useTheme("light");
  const DarkTheme = useTheme("dark");
  const LightTheme = useTheme("light");
  const params = useLocalSearchParams<SplitSummaryParams>();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const currencyCode = useSettingsStore((state) => state.currency);
  const currency = getCurrency(currencyCode);
  const getVariantPrinterLogo = useSettingsStore(
    (state) => state.getVariantPrinterLogo,
  );
  const addLog = useLogsStore((state) => state.addLog);
  const { top } = useSafeAreaInsets();
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const isPrintingRef = useRef(false);

  const circleScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  const paymentIds: string[] = useMemo(() => {
    try {
      return JSON.parse(params.paymentIds || "[]");
    } catch {
      return [];
    }
  }, [params.paymentIds]);

  const perPersonAmount = params.perPersonAmount;
  const splitCount = Number(params.splitCount);
  const collectedTotalCents = amountToCents(perPersonAmount) * splitCount;
  const collectedTotal = (collectedTotalCents / 100).toFixed(2);

  const handleDone = () => {
    resetNavigation("/amount");
  };

  const handlePrintReceipt = async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;
    setIsPrinting(true);
    try {
      await printSplitSummaryReceipt({
        totalFiat: Number(collectedTotal),
        currency,
        splits: paymentIds.map((paymentId) => ({
          paymentId,
          amountFiat: Number(perPersonAmount),
        })),
        logoBase64: getVariantPrinterLogo(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addLog("error", errorMessage, "split-summary", "handlePrintReceipt");
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
            addLog("error", error, "split-summary", "initPrinter");
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          addLog("error", errorMessage, "split-summary", "initPrinter");
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

      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <View
          testID="pos-split-summary"
          nativeID="pos-split-summary"
          style={styles.content}
        >
          <ThemedText
            style={[styles.title, { color: Theme["text-payment-success"] }]}
          >
            Payment complete
          </ThemedText>
          <ThemedText
            style={[
              styles.amountValue,
              { color: Theme["text-payment-success"] },
            ]}
          >
            {formatAmountWithSymbol(collectedTotal, currency)}
          </ThemedText>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {paymentIds.map((id, index) => (
              <View
                key={id}
                style={[
                  styles.row,
                  { borderColor: Theme["border-payment-success"] },
                ]}
              >
                <View style={styles.rowLeft}>
                  <ThemedText
                    style={[
                      styles.rowLabel,
                      { color: Theme["text-payment-success"] },
                    ]}
                  >
                    Payment {index + 1} of {paymentIds.length}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.rowId,
                      { color: Theme["text-payment-success"] },
                    ]}
                  >
                    {truncateId(id)}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.rowAmount,
                    { color: Theme["text-payment-success"] },
                  ]}
                >
                  {formatAmountWithSymbol(perPersonAmount, currency)}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
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
                {isPrinting ? "Printing..." : "Print total receipt"}
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
                backgroundColor: LightTheme["foreground-primary"],
                borderColor: LightTheme["border-secondary"],
              },
            ]}
            onPress={handleDone}
          >
            <ThemedText
              style={[styles.buttonText, { color: DarkTheme["text-invert"] }]}
            >
              Done
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
  content: {
    flex: 1,
    paddingTop: Spacing["spacing-6"],
  },
  title: {
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  amountValue: {
    fontSize: 38,
    lineHeight: 38,
    textAlign: "center",
    marginBottom: Spacing["spacing-6"],
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-3"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-4"],
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius["3"],
  },
  rowLeft: {
    gap: Spacing["spacing-1"],
  },
  rowLabel: {
    fontSize: 16,
    lineHeight: 18,
  },
  rowId: {
    fontSize: 12,
    lineHeight: 14,
    opacity: 0.7,
  },
  rowAmount: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "KH Teka Medium",
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
