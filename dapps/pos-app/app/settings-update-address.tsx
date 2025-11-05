import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Namespace } from "@/utils/types";
import {
  useAccount,
  useAppKit,
  useAppKitState,
} from "@reown/appkit-react-native";
import { Image } from "expo-image";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

interface ScreenParams extends UnknownOutputParams {
  namespace: Namespace;
}

export default function SettingsUpdateAddress() {
  const Theme = useTheme();
  const { namespace } = useLocalSearchParams<ScreenParams>();
  const { setNetworkAddress, networkAddresses } = useSettingsStore(
    (state) => state,
  );
  const { open, disconnect } = useAppKit();
  const { allAccounts } = useAccount();
  const { isConnected } = useAppKitState();

  const handleOpenAppKit = () => {
    open({ view: "WalletConnect" });
  };

  const handleScanAddress = () => {
    router.push({
      pathname: "/settings-scan-address",
      params: {
        namespace,
      },
    });
  };

  useEffect(() => {
    if (isConnected) {
      // Update all empty addresses
      Object.keys(networkAddresses).forEach((key) => {
        const networkAddress = allAccounts.find(
          (account) => account.namespace === key,
        )?.address;
        if (
          networkAddress &&
          (networkAddresses[key as Namespace] === "" || key === namespace)
        ) {
          setNetworkAddress(key as Namespace, networkAddress);
        }
      });
      disconnect();
      router.dismissTo("/settings-address-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, allAccounts, disconnect, namespace, setNetworkAddress]);

  return (
    <View style={styles.container}>
      <Card style={styles.card} onPress={handleScanAddress}>
        <ThemedText>Set or update address via QR code</ThemedText>
        <Image
          cachePolicy="memory-disk"
          priority="high"
          contentFit="contain"
          source={require("@/assets/images/scan.png")}
          style={[styles.scanIcon, { tintColor: Theme["text-primary"] }]}
        />
      </Card>
      <Card style={styles.card} onPress={handleOpenAppKit}>
        <ThemedText>Set or update address via Reown</ThemedText>
        <Image
          cachePolicy="memory-disk"
          priority="high"
          contentFit="contain"
          source={require("@/assets/images/reown-logo.png")}
          style={styles.reownLogo}
        />
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
    justifyContent: "space-between",
    alignItems: "center",
    height: 100,
  },
  scanIcon: {
    width: 24,
    height: 24,
  },
  reownLogo: {
    width: 40,
    height: 20,
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
