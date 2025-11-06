import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { Switch } from "@/components/switch";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CaipNetworkId, getNetworkByCaipId } from "@/utils/networks";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

export default function SettingsNetworks() {
  const Theme = useTheme();
  const { toggleSupportedNetwork, supportedNetworks } = useSettingsStore(
    (state) => state,
  );

  const handleNetworkSwitch = (networkId: CaipNetworkId) => {
    toggleSupportedNetwork(networkId);
  };

  return (
    <View>
      <FlatList
        data={Array.from(supportedNetworks.entries())}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const [networkId, isEnabled] = item;
          const network = getNetworkByCaipId(networkId);

          return (
            <Card
              style={[styles.item, { borderColor: Theme["border-primary"] }]}
            >
              <View style={styles.leftContainer}>
                <Image
                  source={{ uri: network?.icon ?? "chain_placeholder" }}
                  style={styles.networkLogo}
                />
                <ThemedText color="text-tertiary">{network?.name}</ThemedText>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={() =>
                  handleNetworkSwitch(networkId as CaipNetworkId)
                }
              />
            </Card>
          );
        }}
        keyExtractor={(item) => item[0]}
      />
      <LinearGradient
        colors={[
          Theme["bg-primary"] + "00", // Transparent at top
          Theme["bg-primary"] + "40", // More transparent earlier
          Theme["bg-primary"] + "CC", // Strong fade
          Theme["bg-primary"], // Solid at bottom
        ]}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />
      <CloseButton style={styles.closeButton} onPress={router.dismissAll} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-5"],
    paddingBottom: Spacing["extra-spacing-2"],
    gap: Spacing["spacing-3"],
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing["spacing-7"],
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: Spacing["spacing-4"],
  },
  networkLogo: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius["full"],
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // Adjust height as needed
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
