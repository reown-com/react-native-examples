import { Image, StyleSheet } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
}

export default function PaymentMethodScreen() {
  const Theme = useTheme();
  const { amount } = useLocalSearchParams<ScreenParams>();

  const handleWalletConnectPayPress = () => {
    router.push({
      pathname: "/payment-token",
      params: {
        amount,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Button
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/payment-methods/card.png")}
          style={styles.cardsImage}
        />
        <ThemedText fontSize={16}>Pay with credit/debit card</ThemedText>
      </Button>
      <Button
        onPress={handleWalletConnectPayPress}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/payment-methods/crypto.png")}
          style={styles.cryptoImage}
        />
        <ThemedText fontSize={16}>Pay with Crypto</ThemedText>
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-7"],
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: BorderRadius["5"],
    gap: Spacing["spacing-4"],
  },
  cardsImage: {
    height: 29,
    width: 140,
  },
  cryptoImage: {
    height: 40,
    width: 140,
  },
});
