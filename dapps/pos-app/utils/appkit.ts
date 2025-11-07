import "@walletconnect/react-native-compat";

import { useSettingsStore } from "@/store/useSettingsStore";
import { createAppKit, solana } from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { mainnet } from "viem/chains";
import { storage } from "./storage";

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID!;

export const posClientMetadata = {
  merchantName: "WPay",
  description: "WalletConnect Point of Sale",
  logoIcon:
    "https://raw.githubusercontent.com/reown-com/react-native-examples/refs/heads/main/dapps/pos-app/assets/images/icon.png",
  url: "https://walletconnect.com",
};

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  },
  features: {
    onramp: false,
    swaps: false,
  },
  metadata: {
    name: posClientMetadata.merchantName,
    description: posClientMetadata.description,
    url: posClientMetadata.url,
    icons: [posClientMetadata.logoIcon],
  },
});
