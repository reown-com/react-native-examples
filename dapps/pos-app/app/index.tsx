import { Image, StyleSheet } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { usePOS } from "@/context/POSContext";
import { useTheme } from "@/hooks/use-theme-color";
import { useAppKit, useAppKitState } from "@reown/appkit-react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const { isInitialized } = usePOS();
  const { isConnected } = useAppKitState();
  const { open } = useAppKit();
  const Theme = useTheme();

  const handleStartPayment = () => {
    router.push("/amount");
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <ThemedView style={styles.container}>
      <Button
        onPress={handleStartPayment}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/plus.png")}
          style={styles.actionButtonImage}
        />
        <ThemedText fontSize={18}>New sale</ThemedText>
      </Button>
      <Button
        onPress={handleSettingsPress}
        style={[
          styles.actionButton,
          { backgroundColor: Theme["foreground-primary"] },
        ]}
      >
        <Image
          source={require("@/assets/images/gear.png")}
          style={styles.actionButtonImage}
        />
        <ThemedText fontSize={18}>Settings</ThemedText>
      </Button>
      {/* <ThemedView style={styles.stepContainer}>
        <ThemedText type="title" style={styles.title}>
          Mobile POS Terminal
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.subtitle}>
          by WalletConnect
        </ThemedText>
      </ThemedView>
      {isConnected ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.primaryButton,
            {
              backgroundColor: !isInitialized
                ? Theme["icon-default"]
                : Theme["bg-accent-primary"],
              shadowColor: Theme["bg-accent-primary"],
            },
          ]}
          onPress={handleStartPayment}
          disabled={!isInitialized}
        >
          <IconSymbol
            name="creditcard.fill"
            size={20}
            color={Theme["text-invert"]}
          />
          <ThemedText
            style={[styles.primaryButtonText, { color: Theme["text-invert"] }]}
          >
            Start New Payment
          </ThemedText>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => open()}
          style={[
            styles.primaryButton,
            {
              backgroundColor: Theme["bg-accent-primary"],
              shadowColor: Theme["bg-accent-primary"],
            },
          ]}
        >
          <IconSymbol
            name="creditcard.fill"
            size={20}
            color={Theme["text-invert"]}
          />
          <ThemedText
            style={[styles.primaryButtonText, { color: Theme["text-invert"] }]}
          >
            Connect Recipient Wallet
          </ThemedText>
        </TouchableOpacity>
      )} */}
      {/* <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/payment-success",
            params: {
              transactionHash: "0x1234567890",
              explorerLink: "https://etherscan.io/tx/0x1234567890",
              network: "Ethereum",
              amount: "100",
              token: "ETH",
              recipientAddress: "0x1234567890",
            },
          });
        }}
      >
        <ThemedText>Go to mocked payment success</ThemedText>
      </TouchableOpacity> */}
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
  actionButtonImage: {
    width: 32,
    height: 32,
  },

  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
  },
  stepContainer: {
    gap: Spacing["spacing-05"],
    marginBottom: Spacing["spacing-2"],
  },
  logo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: Spacing["spacing-2"],
  },
});
