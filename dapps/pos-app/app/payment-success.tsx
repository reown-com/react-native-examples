import { UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
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
import { useTheme } from "@/hooks/use-theme-color";
import { resetNavigation } from "@/utils/navigation";

interface SuccessParams extends UnknownOutputParams {
  amount: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const diagonalLength = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
const initialCircleSize = 20;
const finalScale = Math.ceil(diagonalLength / initialCircleSize) + 2;

export default function PaymentSuccessScreen() {
  const Theme = useTheme();
  const params = useLocalSearchParams<SuccessParams>();
  const insets = useSafeAreaInsets();
  const { amount } = params;

  const circleScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  const handleNewPayment = () => {
    resetNavigation("/amount");
  };

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Expanding circle background */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: Theme["text-success"],
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
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText
            style={[styles.amountDescription, { color: Theme["text-invert"] }]}
          >
            Payment Successful
          </ThemedText>
          <ThemedText
            style={[styles.amountValue, { color: Theme["text-invert"] }]}
          >
            ${amount}
          </ThemedText>
        </View>
        <View style={styles.buttonContainer}>
          {/* <Button
            onPress={() => {}}
            style={[
              styles.button,
              {
                backgroundColor: Theme["text-success"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <ThemedText
              style={[styles.buttonText, { color: Theme["text-invert"] }]}
            >
              Send email receipt
            </ThemedText>
          </Button> */}

          <Button
            style={[
              styles.button,
              {
                backgroundColor: Theme["bg-primary"],
                borderColor: Theme["bg-primary"],
              },
            ]}
            onPress={handleNewPayment}
          >
            <ThemedText
              style={[styles.buttonText, { color: Theme["text-primary"] }]}
            >
              New Sale
            </ThemedText>
          </Button>
        </View>
      </Animated.View>
    </View>
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
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 20,
  },
});
