import "@walletconnect/react-native-compat";

import { useSettingsStore } from "@/store/useSettingsStore";
import { createAppKit, solana } from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import * as Clipboard from "expo-clipboard";
import { mainnet } from "viem/chains";
import { storage } from "./storage";

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID!;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet],
});

const solanaAdapter = new SolanaAdapter();

const { themeMode } = useSettingsStore.getState();

export const appKit = createAppKit({
  projectId,
  networks: [mainnet, solana],
  defaultNetwork: mainnet,
  adapters: [wagmiAdapter, solanaAdapter],
  storage,
  themeMode,
  clipboardClient: {
    setString: async (value: string) => {
      await Clipboard.setStringAsync(value);
    },
  },
  features: {
    onramp: false,
    swaps: false,
  },
  metadata: {
    name: "WPay",
    description: "WalletConnect Point of Sale",
    url: "https://walletconnect.com",
    icons: [
      "https://raw.githubusercontent.com/reown-com/react-native-examples/refs/heads/main/dapps/pos-app/icon.png",
    ],
  },
});
