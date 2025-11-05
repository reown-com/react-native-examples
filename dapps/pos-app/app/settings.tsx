import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Settings() {
  // const { allAccounts } = useAccount();
  const { themeMode, setThemeMode } = useSettingsStore((state) => state);
  // const { disconnect, open } = useAppKit();
  // const { isConnected } = useAppKitState();

  // const groupedAccounts = allAccounts ? getAccounts(allAccounts) : [];

  // const onAppKitPress = () => {
  //   if (isConnected) {
  //     disconnect();
  //   } else {
  //     open({ view: "WalletConnect" });
  //   }
  // };

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!isConnected) {
  //       open({ view: "WalletConnect" });
  //     }
  //   }, [isConnected, open]),
  // );

  const handleRecipientPress = () => {
    router.push("/settings-recipient");
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Dark Mode
        </ThemedText>
        <Switch
          style={styles.switch}
          value={themeMode === "dark"}
          onValueChange={(value) => setThemeMode(value ? "dark" : "light")}
        />
      </Card>
      <Card onPress={handleRecipientPress} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Recipient addresses
        </ThemedText>
      </Card>
      <Card onPress={() => {}} style={styles.card}>
        <ThemedText fontSize={16} lineHeight={18}>
          Networks
        </ThemedText>
      </Card>
      <CloseButton style={styles.closeButton} onPress={router.dismissAll} />
    </View>
  );

  // return isConnected ? (
  //   <View style={styles.container}>
  //     <FlatList
  //       data={groupedAccounts}
  //       contentContainerStyle={styles.list}
  //       renderItem={({ item }) => {
  //         const network = getNetworkById(item.chainId);
  //         return (
  //           <View
  //             style={[styles.item, { borderColor: Theme["border-primary"] }]}
  //           >
  //             <View style={styles.networkContainer}>
  //               <ThemedText
  //                 style={[styles.network, { color: Theme["text-tertiary"] }]}
  //               >
  //                 {item.network?.name}
  //               </ThemedText>
  //               <ThemedText
  //                 style={[styles.address, { color: Theme["text-primary"] }]}
  //                 numberOfLines={1}
  //                 ellipsizeMode="middle"
  //               >
  //                 {item.address}
  //               </ThemedText>
  //             </View>
  //             <Image
  //               source={
  //                 getIcon(network?.icon) ??
  //                 require("@/assets/images/chains/chain-placeholder.png")
  //               }
  //               cachePolicy="memory-disk"
  //               priority="high"
  //               style={styles.networkLogo}
  //             />
  //           </View>
  //         );
  //       }}
  //       keyExtractor={(item) => `${item.chainId}-${item.address}`}
  //     />
  //     <Button
  //       style={[
  //         styles.disconnectButton,
  //         { backgroundColor: Theme["bg-accent-primary"] },
  //       ]}
  //       onPress={onAppKitPress}
  //     >
  //       <ThemedText
  //         style={[styles.disconnectText, { color: Theme["text-invert"] }]}
  //       >
  //         Disconnect Wallet
  //       </ThemedText>
  //     </Button>
  //   </View>
  // ) : (
  //   <View style={styles.disconnectedContainer}>
  //     <Button
  //       style={[
  //         styles.connectButton,
  //         {
  //           backgroundColor: Theme["foreground-primary"],
  //         },
  //       ]}
  //       onPress={onAppKitPress}
  //     >
  //       <Image
  //         source={require("@/assets/images/wallet.png")}
  //         style={[
  //           styles.connectButtonImage,
  //           { tintColor: Theme["icon-default"] },
  //         ]}
  //         cachePolicy="memory-disk"
  //         priority="high"
  //       />
  //       <ThemedText
  //         fontSize={18}
  //         style={[
  //           styles.connectText,
  //           {
  //             color: Theme["text-primary"],
  //           },
  //         ]}
  //       >
  //         Connect Recipient Wallet
  //       </ThemedText>
  //     </Button>
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing["spacing-5"],
    paddingBottom: Spacing["spacing-7"],
    paddingHorizontal: Spacing["spacing-5"],
    gap: Spacing["spacing-3"],
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
  },
  switch: {
    alignSelf: "center",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: Spacing["spacing-2"],
  },
  list: {
    paddingTop: Spacing["spacing-2"],
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
  networkContainer: {
    flex: 1,
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
  disconnectButton: {
    position: "absolute",
    bottom: Spacing["spacing-2"],
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["5"],
    marginHorizontal: Spacing["spacing-5"],
  },
  disconnectText: {
    fontSize: 18,
    lineHeight: 20,
  },
  disconnectedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-5"],
  },
  connectButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 300,
    borderRadius: BorderRadius["5"],
    gap: Spacing["spacing-4"],
  },
  connectButtonImage: {
    width: 32,
    height: 32,
  },
  connectText: {
    fontSize: 18,
    lineHeight: 20,
  },
});
