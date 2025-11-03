import * as Haptics from "expo-haptics";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/button";
import { TokenKey } from "@/utils/networks";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const diagonalLength = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
const initialCircleSize = 20;
const finalScale = Math.round(diagonalLength / initialCircleSize) + 1;

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  token: TokenKey;
  networkCaipId: string;
  recipientAddress: string;
}

export default function PaymentSuccessScreen() {
  const Theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ScreenParams>();

  const circleScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const handleRetry = () => {
    const { amount, token, networkCaipId, recipientAddress } = params;
    router.dismissTo({
      pathname: "/scan",
      params: {
        amount,
        token,
        networkCaipId,
        recipientAddress,
      },
    });
  };

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.parallel([
      Animated.spring(circleScale, {
        toValue: finalScale,
        tension: 15,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Expanding circle background */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: Theme["bg-primary"],
            width: initialCircleSize,
            height: initialCircleSize,
            borderRadius: initialCircleSize / 2,
            transform: [{ scale: circleScale }],
          },
        ]}
      />

      {/* Content that fades in after circle expands */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("@/assets/images/warning-circle.png")}
            style={styles.warningCircle}
          />
          <ThemedText
            style={[styles.failedText, { color: Theme["text-primary"] }]}
          >
            Payment failed
          </ThemedText>
          <ThemedText
            style={[
              styles.failedDescription,
              { color: Theme["text-secondary"] },
            ]}
          >
            The payment couldn’t be completed due to an error. Please try again
            or use a different payment method.
          </ThemedText>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleRetry}
            style={[
              styles.button,
              {
                backgroundColor: Theme["bg-accent-primary"],
              },
            ]}
          >
            <ThemedText
              style={[styles.buttonText, { color: Theme["text-invert"] }]}
            >
              Try again
            </ThemedText>
          </Button>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Spacing["spacing-5"],
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
  failedText: {
    fontSize: 26,
    lineHeight: 28,
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  failedDescription: {
    fontSize: 16,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: Spacing["spacing-3"],
  },
  warningCircle: {
    width: 48,
    height: 48,
    marginBottom: Spacing["spacing-3"],
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
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 20,
  },
});
