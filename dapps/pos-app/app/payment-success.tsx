import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
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
        { paddingTop: insets.top, backgroundColor: Theme.background },
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
              backgroundColor: Theme.successBackground,
              shadowColor: Theme.success,
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
            color={Theme.success}
          />
        </Animated.View>

        {/* Transaction Details Card - WRAP WITH Animated.View */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: Theme.cardBackground,
              borderColor: Theme.borderLight,
              shadowColor: Theme.cardShadow,
              transform: [{ translateY: cardTranslateY }],
              opacity: cardOpacity,
            },
          ]}
        >
          <ThemedText style={[styles.detailsTitle, { color: Theme.text }]}>
            Transaction Details
          </ThemedText>

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: Theme.text }]}>
              Amount
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: Theme.text }]}>
              {amount} {token}
            </ThemedText>
          </View>

          <View
            style={[styles.separator, { backgroundColor: Theme.borderLight }]}
          />

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: Theme.text }]}>
              Network
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: Theme.text }]}>
              {network}
            </ThemedText>
          </View>

          <View
            style={[styles.separator, { backgroundColor: Theme.borderLight }]}
          />

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: Theme.text }]}>
              Recipient
            </ThemedText>
            <ThemedText
              style={[styles.detailValue, { color: Theme.text }]}
              numberOfLines={1}
            >
              {formatAddress(recipientAddress)}
            </ThemedText>
          </View>

          <View
            style={[styles.separator, { backgroundColor: Theme.borderLight }]}
          />

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: Theme.text }]}>
              Transaction Hash
            </ThemedText>
            <ThemedText
              style={[styles.detailValue, { color: Theme.text }]}
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
                backgroundColor: Theme.cardBackground,
              },
            ]}
            onPress={handleViewOnExplorer}
          >
            <IconSymbol name="safari" size={20} color={Theme.text} />
            <ThemedText
              style={[styles.explorerButtonText, { color: Theme.text }]}
            >
              View on Explorer
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.explorerButton,
              {
                backgroundColor: Theme.cardBackground,
              },
            ]}
            onPress={handleGoToMainScreen}
          >
            <IconSymbol name="house.fill" size={20} color={Theme.text} />
            <ThemedText
              style={[styles.explorerButtonText, { color: Theme.text }]}
            >
              Go to main screen
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.newPaymentButton,
              {
                backgroundColor: Theme.success,
              },
            ]}
            onPress={handleNewPayment}
          >
            <IconSymbol name="plus.circle" size={20} color={Theme.white} />
            <ThemedText style={styles.newPaymentButtonText}>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
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
    marginBottom: 20,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
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
    marginVertical: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 6,
  },
  explorerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  explorerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  newPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newPaymentButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
