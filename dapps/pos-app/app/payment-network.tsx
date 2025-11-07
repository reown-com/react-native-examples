import { Button } from "@/components/button";
import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  getTokenAvailableNetworks,
  getTokenById,
  TokenKey,
} from "@/utils/networks";
import { showErrorToast } from "@/utils/toast";
import { Namespace } from "@/utils/types";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  token: TokenKey;
}

export default function PaymentNetworkScreen() {
  const Theme = useTheme();
  const { amount, token } = useLocalSearchParams<ScreenParams>();
  const { networkAddresses, getEnabledNetworks } = useSettingsStore(
    (state) => state,
  );

  const tokenData = getTokenById(token);
  const tokenNetworks = getTokenAvailableNetworks(token);
  const enabledNetworks = getEnabledNetworks();

  const availableNetworks = tokenNetworks.filter((network) =>
    enabledNetworks.some((n) => n.id === network.id),
  );

  const handleOnClosePress = () => {
    router.dismissAll();
    router.navigate("/amount");
  };

  const handleNetworkPress = (networkCaipId: string) => {
    const namespace = networkCaipId.split(":")[0];
    const recipientAddress = networkAddresses[namespace as Namespace];
    const tokenAddress = tokenData?.addresses[networkCaipId];

    if (!tokenAddress) {
      showErrorToast({
        title: "Token address not found",
        message: "Please select another network",
      });
      return;
    }

    if (!recipientAddress) {
      router.push("/address-not-set");
      return;
    }

    router.push({
      pathname: "/scan",
      params: {
        amount,
        token,
        tokenAddress,
        networkCaipId,
        recipientAddress,
      },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={availableNetworks}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Button
            style={[
              styles.item,
              { backgroundColor: Theme["foreground-primary"] },
            ]}
            onPress={() => handleNetworkPress(item.caipNetworkId)}
          >
            <ThemedText fontSize={16}>
              {tokenData?.symbol} on {item.name}
            </ThemedText>
            <ImageBackground
              source={{ uri: tokenData?.icon }}
              style={styles.tokenIcon}
              resizeMode="contain"
            >
              <Image
                source={{ uri: item.icon }}
                style={[
                  styles.chainIcon,
                  { borderColor: Theme["border-primary"] },
                ]}
                cachePolicy="memory-disk"
                priority="high"
              />
            </ImageBackground>
          </Button>
        )}
      />
      <CloseButton style={styles.closeButton} onPress={handleOnClosePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing["spacing-5"],
    flex: 1,
  },
  listContainer: {
    gap: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Spacing["extra-spacing-1"],
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    padding: Spacing["spacing-6"],
    borderRadius: BorderRadius["5"],
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius["5"],
  },
  chainIcon: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: BorderRadius["5"],
    bottom: -2,
    right: -2,
    position: "absolute",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
