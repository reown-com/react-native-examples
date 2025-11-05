import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Namespace } from "@/utils/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SettingsRecipient() {
  const { networkAddresses } = useSettingsStore((state) => state);

  const solanaAddress = networkAddresses.solana;
  const eip155Address = networkAddresses.eip155;

  const handleAddressPress = (namespace: Namespace) => {
    router.push({
      pathname: "/settings-address",
      params: { namespace },
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card} onPress={() => handleAddressPress("solana")}>
        <Image
          style={styles.logo}
          source={require("@/assets/images/chains/solana.png")}
          cachePolicy="memory-disk"
          priority="high"
        />
        <View style={styles.textContainer}>
          <ThemedText fontSize={14} lineHeight={16} color="text-tertiary">
            Solana
          </ThemedText>
          <ThemedText numberOfLines={1} ellipsizeMode="middle">
            {solanaAddress || "No address"}
          </ThemedText>
        </View>
      </Card>
      <Card style={styles.card} onPress={() => handleAddressPress("eip155")}>
        <Image
          style={styles.logo}
          source={require("@/assets/images/chains/eip155-1.png")}
          cachePolicy="memory-disk"
          priority="high"
        />
        <View style={styles.textContainer}>
          <ThemedText fontSize={14} lineHeight={16} color="text-tertiary">
            EVM Networks
          </ThemedText>
          <ThemedText numberOfLines={1} ellipsizeMode="middle">
            {eip155Address || "No address"}
          </ThemedText>
        </View>
      </Card>
      <CloseButton style={styles.closeButton} onPress={router.dismissAll} />
    </View>
  );
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
    alignItems: "flex-start",
    padding: Spacing["spacing-7"],
    columnGap: Spacing["spacing-4"],
  },
  textContainer: {
    justifyContent: "center",
    alignSelf: "center",
    flexShrink: 1,
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius["full"],
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: Spacing["spacing-2"],
  },
});
