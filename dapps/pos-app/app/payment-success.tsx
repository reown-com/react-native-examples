import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useSuccessAnimations } from "@/hooks/use-success-animations";
import { useTheme } from "@/hooks/use-theme-color";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SuccessParams extends UnknownOutputParams {
  transactionHash: string;
  explorerLink: string;
  network: string;
  amount: string;
  token: string;
  recipientAddress: string;
}

export default function PaymentSuccessScreen() {
  const Theme = useTheme();
  const params = useLocalSearchParams<SuccessParams>();
  const insets = useSafeAreaInsets();
  const {
    transactionHash,
    explorerLink,
    network,
    amount,
    token,
    recipientAddress,
  } = params;

  // Get animation values from custom hook
  const {
    iconScale,
    iconOpacity,
    iconTranslateY,
    pulseScale,
    cardTranslateY,
    cardOpacity,
    buttonsTranslateY,
    buttonsOpacity,
  } = useSuccessAnimations();

  const handleViewOnExplorer = async () => {
    try {
      await Linking.openURL(explorerLink);
    } catch {
      showErrorToast({ title: "Could not open explorer link" });
    }
  };

  const handleOnHashPress = () => {
    Clipboard.setStringAsync(transactionHash);
    showSuccessToast({ title: "Copied to clipboard" });
  };

  const handleNewPayment = () => {
    router.replace("/payment");
  };

  const handleGoToMainScreen = () => {
    router.replace("/");
  };

  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const formatHash = (hash: string) => {
    if (hash.length > 20) {
      return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    }
    return hash;
  };

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: Theme["bg-primary"] },
      ]}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
    >
      <ThemedView style={styles.content}>
        {/* Success Icon with Background Circle */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: Theme["bg-success"],
              shadowColor: Theme["icon-success"],
              transform: [
                { scale: Animated.multiply(iconScale, pulseScale) },
                { translateY: iconTranslateY },
              ],
              opacity: iconOpacity,
            },
          ]}
        >
          <IconSymbol
            name="checkmark.circle.fill"
            size={100}
            color={Theme["icon-success"]}
          />
        </Animated.View>

        {/* Transaction Details Card - WRAP WITH Animated.View */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: Theme["foreground-primary"],
              borderColor: Theme["border-primary"],
              shadowColor: Theme["border-secondary"],
              transform: [{ translateY: cardTranslateY }],
              opacity: cardOpacity,
            },
          ]}
        >
          <ThemedText
            style={[styles.detailsTitle, { color: Theme["text-primary"] }]}
          >
            Transaction Details
          </ThemedText>

          <View style={styles.detailRow}>
            <ThemedText
              style={[styles.detailLabel, { color: Theme["text-primary"] }]}
            >
              Amount
            </ThemedText>
            <ThemedText
              style={[styles.detailValue, { color: Theme["text-primary"] }]}
            >
              {amount} {token}
            </ThemedText>
          </View>

          <View
            style={[
              styles.separator,
              { backgroundColor: Theme["border-primary"] },
            ]}
          />

          <View style={styles.detailRow}>
            <ThemedText
              style={[styles.detailLabel, { color: Theme["text-primary"] }]}
            >
              Network
            </ThemedText>
            <ThemedText
              style={[styles.detailValue, { color: Theme["text-primary"] }]}
            >
              {network}
            </ThemedText>
          </View>

          <View
            style={[
              styles.separator,
              { backgroundColor: Theme["border-primary"] },
            ]}
          />

          <View style={styles.detailRow}>
            <ThemedText
              style={[styles.detailLabel, { color: Theme["text-primary"] }]}
            >
              Recipient
            </ThemedText>
            <ThemedText
              style={[styles.detailValue, { color: Theme["text-primary"] }]}
              numberOfLines={1}
            >
              {formatAddress(recipientAddress)}
            </ThemedText>
          </View>

          <View
            style={[
              styles.separator,
              { backgroundColor: Theme["border-primary"] },
            ]}
          />

          <View style={styles.detailRow}>
            <ThemedText
              style={[styles.detailLabel, { color: Theme["text-primary"] }]}
            >
              Transaction Hash
            </ThemedText>
            <ThemedText
              style={[
                styles.detailValue,
                { color: Theme["text-accent-primary"] },
              ]}
              numberOfLines={1}
              onPress={handleOnHashPress}
            >
              {formatHash(transactionHash)}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Action Buttons - WRAP WITH Animated.View */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ translateY: buttonsTranslateY }],
              opacity: buttonsOpacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.explorerButton,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
            onPress={handleViewOnExplorer}
          >
            <IconSymbol
              name="safari"
              size={20}
              color={Theme["text-accent-primary"]}
            />
            <ThemedText
              style={[
                styles.explorerButtonText,
                { color: Theme["text-primary"] },
              ]}
            >
              View on Explorer
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.explorerButton,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
            onPress={handleGoToMainScreen}
          >
            <IconSymbol
              name="house.fill"
              size={20}
              color={Theme["text-accent-primary"]}
            />
            <ThemedText
              style={[
                styles.explorerButtonText,
                { color: Theme["text-primary"] },
              ]}
            >
              Go to main screen
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.newPaymentButton,
              {
                backgroundColor: Theme["bg-accent-primary"],
              },
            ]}
            onPress={handleNewPayment}
          >
            <IconSymbol
              name="plus.circle"
              size={20}
              color={Theme["text-invert"]}
            />
            <ThemedText
              style={[
                styles.newPaymentButtonText,
                { color: Theme["text-invert"] },
              ]}
            >
              New Payment
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-5"],
    paddingBottom: Spacing["spacing-8"],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius["full"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-6"],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsContainer: {
    borderRadius: BorderRadius["4"],
    padding: Spacing["spacing-6"],
    marginBottom: Spacing["spacing-8"],
    width: "100%",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing["spacing-5"],
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing["spacing-3"],
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    flex: 2,
    textAlign: "right",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    marginVertical: Spacing["spacing-1"],
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing["spacing-2"],
  },
  explorerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-6"],
    paddingVertical: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  explorerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing["spacing-2"],
  },
  newPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-6"],
    paddingVertical: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newPaymentButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing["spacing-2"],
  },
});
