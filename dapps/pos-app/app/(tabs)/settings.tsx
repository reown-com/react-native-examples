import { StyleSheet, TouchableOpacity } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
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
            <ThemedText style={[styles.networkName, { color: Theme.primary }]}>
              {account.networkName}
            </ThemedText>
            <ThemedView
              key={`${account.address}-${account.chainId}`}
              style={[
                styles.accountItem,
                {
                  backgroundColor: Theme.background,
                  borderColor: Theme.border,
                },
              ]}
            >
              <ThemedText
                style={[styles.accountAddress, { color: Theme.text }]}
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
                backgroundColor: Theme.buttonDisabled,
                shadowColor: Theme.buttonDisabled,
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
              color="white"
            />
            <ThemedText style={styles.appkitButtonText}>
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
    gap: 8,
  },
  accountsContainer: {
    marginTop: 20,
    padding: 16,
    flex: 1,
  },
  label: {
    marginBottom: 16,
    fontWeight: "600",
  },
  scrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  networkGroup: {
    marginBottom: 20,
  },
  networkName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  accountItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  accountAddress: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  appkitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  appkitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
