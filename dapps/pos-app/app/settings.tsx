import { FlatList, Image, StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
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

  //TODO: Cover case where there are multiple accounts with the same chainId

  return (
    <ThemedView style={styles.container}>
      {isConnected && (
        <FlatList
          data={groupedAccounts}
          fadingEdgeLength={20}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const network = getNetworkById(item.chainId);
            return (
              <View
                style={[styles.item, { borderColor: Theme["border-primary"] }]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[styles.network, { color: Theme["text-tertiary"] }]}
                  >
                    {item.networkName}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.accountAddress,
                      { color: Theme["text-primary"] },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {item.address}
                  </ThemedText>
                </View>
                <Image
                  source={
                    network?.icon ??
                    require("@/assets/images/chains/chain-placeholder.png")
                  }
                  style={styles.networkLogo}
                />
              </View>
            );
          }}
          keyExtractor={(item) => `${item.chainId}-${item.address}`}
        />
      )}
      <Button
        style={[
          styles.appkitButton,
          {
            backgroundColor: Theme["bg-accent-primary"],
          },
        ]}
        onPress={() => onAppKitPress()}
      >
        <ThemedText
          style={[styles.appkitButtonText, { color: Theme["text-invert"] }]}
        >
          {isConnected ? "Disconnect Wallet" : "Connect Recipient Wallet"}
        </ThemedText>
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-7"],
  },
  list: {
    paddingHorizontal: Spacing["spacing-5"],
  },
  item: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius["5"],
    marginBottom: Spacing["spacing-5"],
    padding: Spacing["spacing-6"],
  },
  network: {
    fontSize: 14,
    lineHeight: 16,
  },
  networkLogo: {
    marginLeft: Spacing["spacing-6"],
    width: 40,
    height: 40,
    borderRadius: BorderRadius["5"],
  },
  label: {
    marginBottom: Spacing["spacing-4"],
    fontWeight: "600",
  },
  scrollView: {
    maxHeight: 400,
    marginBottom: Spacing["spacing-4"],
  },
  accountAddress: {
    fontSize: 16,
    lineHeight: 18,
  },
  appkitButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["5"],
    marginHorizontal: Spacing["spacing-5"],
  },
  appkitButtonText: {
    fontSize: 18,
    lineHeight: 20,
  },
});
