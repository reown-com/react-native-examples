import "@walletconnect/react-native-compat";

import { createAppKit } from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { NETWORKS_LIST, WAGMI_NETWORKS_LIST } from "./networks";
import { storage } from "./storage";

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID!;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: WAGMI_NETWORKS_LIST,
});

const solanaAdapter = new SolanaAdapter();

export const appKit = createAppKit({
  projectId,
  networks: NETWORKS_LIST,
  defaultNetwork: NETWORKS_LIST[0],
  adapters: [wagmiAdapter, solanaAdapter],
  storage,
  clipboardClient: {
    setString: async (value: string) => {
      await Clipboard.setStringAsync(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  },
  metadata: {
    name: "Mobile POS Terminal",
    description: "Mobile POS terminal for crypto payments",
    url: "https://reown.com/appkit",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
});
