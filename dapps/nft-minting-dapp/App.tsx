import React, { useEffect } from "react";
import "@walletconnect/react-native-compat";
import { WagmiConfig } from "wagmi";
import { goerli, mainnet } from "viem/chains";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  W3mButton,
  Web3Modal,
} from "@web3modal/wagmi-react-native";
import { View, StyleSheet, Text, Image } from "react-native";
import MintSection from "./src/components/MintSection";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "XXX";

// 2. Create config
const metadata = {
  name: "Web3Modal RN",
  description: "Web3Modal RN Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

const chains = [goerli, mainnet];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
});

export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <Web3Modal />
      <View style={styles.container}>
        <W3mButton />
        <Image
          source={require("./assets/W3MRN.png")}
          style={{
            width: 200,
            height: 200,
            borderRadius: 10,
            marginVertical: 16,
          }}
        />

        <MintSection />
      </View>
    </WagmiConfig>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
