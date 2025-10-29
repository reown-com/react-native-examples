import { FlatList, Image, StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { getAccounts } from "@/utils/accounts";
import { getNetworkById } from "@/utils/networks";
import {
  useAccount,
  useAppKit,
  useAppKitState,
} from "@reown/appkit-react-native";

export default function Settings() {
  const Theme = useTheme();
  const { allAccounts } = useAccount();
  const { disconnect, open } = useAppKit();
  const { isConnected } = useAppKitState();

  const groupedAccounts = allAccounts ? getAccounts(allAccounts) : [];

  const onAppKitPress = () => {
    if (isConnected) {
      disconnect();
    } else {
      open();
    }
  };

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
                    {item.network?.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.address, { color: Theme["text-primary"] }]}
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
            position: isConnected ? "absolute" : "relative",
          },
        ]}
        onPress={onAppKitPress}
      >
        <ThemedText
          style={[
            styles.appkitButtonText,
            {
              color: Theme["text-invert"],
            },
          ]}
        >
          {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
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
    paddingBottom: Spacing["extra-spacing-1"],
    gap: Spacing["spacing-3"],
  },
  item: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius["5"],
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
  address: {
    fontSize: 16,
  },
  appkitButton: {
    position: "absolute",
    bottom: Spacing["spacing-5"],
    left: 0,
    right: 0,
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
