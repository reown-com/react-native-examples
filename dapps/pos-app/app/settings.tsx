import { StyleSheet, TouchableOpacity } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { getNetworkById } from "@/utils/networks";
import {
  useAccount,
  useAppKit,
  useAppKitState,
} from "@reown/appkit-react-native";

const getNetworkName = (chainId: string) => {
  const network = getNetworkById(chainId);
  return network?.name;
};

const formatAccounts = (accounts: any[]) => {
  return accounts
    .map((account) => ({
      address: account.address,
      namespace: account.namespace,
      chainId: account.chainId,
      networkName: getNetworkName(account.chainId),
    }))
    .filter((account) => account.networkName);
};

export default function Settings() {
  const Theme = useTheme();
  const { allAccounts } = useAccount();
  const { disconnect, open } = useAppKit();
  const { isConnected } = useAppKitState();

  const groupedAccounts = allAccounts ? formatAccounts(allAccounts) : [];

  const onAppKitPress = () => {
    if (isConnected) {
      disconnect();
    } else {
      open();
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Settings
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.accountsContainer}>
        {isConnected && (
          <ThemedText type="subtitle" style={styles.label}>
            Recipient Addresses
          </ThemedText>
        )}

        {groupedAccounts.map((account) => (
          <ThemedView key={account.chainId} style={styles.networkGroup}>
            <ThemedText
              style={[
                styles.networkName,
                { color: Theme["text-accent-primary"] },
              ]}
            >
              {account.networkName}
            </ThemedText>
            <ThemedView
              key={`${account.address}-${account.chainId}`}
              style={[
                styles.accountItem,
                {
                  backgroundColor: Theme["foreground-primary"],
                  borderColor: Theme["border-primary"],
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.accountAddress,
                  { color: Theme["text-primary"] },
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {account.address}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
        {isConnected ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.appkitButton,
              {
                backgroundColor: Theme["icon-error"],
                shadowColor: Theme["icon-error"],
              },
            ]}
            onPress={() => onAppKitPress()}
          >
            <IconSymbol
              name={
                isConnected
                  ? "rectangle.portrait.and.arrow.right"
                  : "creditcard.fill"
              }
              size={20}
              color={Theme["text-invert"]}
            />
            <ThemedText
              style={[styles.appkitButtonText, { color: Theme["text-invert"] }]}
            >
              {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <ThemedText type="subtitle" style={styles.label}>
            No recipient wallet connected
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: Spacing["spacing-2"],
  },
  accountsContainer: {
    marginTop: Spacing["spacing-5"],
    padding: Spacing["spacing-4"],
    flex: 1,
  },
  label: {
    marginBottom: Spacing["spacing-4"],
    fontWeight: "600",
  },
  scrollView: {
    maxHeight: 400,
    marginBottom: Spacing["spacing-4"],
  },
  networkGroup: {
    marginBottom: Spacing["spacing-5"],
  },
  networkName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing["spacing-2"],
  },
  accountItem: {
    borderWidth: 1,
    borderRadius: BorderRadius["2"],
    padding: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-2"],
  },
  accountAddress: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  appkitButton: {
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
  appkitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: Spacing["spacing-2"],
  },
});
