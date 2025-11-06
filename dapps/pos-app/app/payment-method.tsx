import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

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
    <View style={styles.container}>
      <Button
        onPress={() => {}}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={{ uri: "card" }}
          style={styles.cardsImage}
          cachePolicy="memory-disk"
          priority="high"
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
          source={{ uri: "wpay" }}
          style={styles.cryptoImage}
          cachePolicy="memory-disk"
          priority="high"
        />
        <ThemedText fontSize={16}>Pay with crypto</ThemedText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-2"],
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
    height: 24,
    width: 80,
  },
});
