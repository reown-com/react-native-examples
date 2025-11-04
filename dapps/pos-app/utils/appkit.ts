import "@walletconnect/react-native-compat";

import { createAppKit } from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { NETWORKS_LIST, WAGMI_NETWORKS_LIST } from "./networks";
import { storage } from "./storage";

let _wagmiAdapter: WagmiAdapter | null = null;
let _solanaAdapter: SolanaAdapter | null = null;
let _appKit: ReturnType<typeof createAppKit> | null = null;

export const getWagmiAdapter = () => {
  if (!_wagmiAdapter) {
    _wagmiAdapter = new WagmiAdapter({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
      networks: WAGMI_NETWORKS_LIST,
    });
  }
  return _wagmiAdapter;
};

export const getSolanaAdapter = () => {
  if (!_solanaAdapter) {
    _solanaAdapter = new SolanaAdapter();
  }
  return _solanaAdapter;
};

export const getAppKit = () => {
  if (!_appKit) {
    _appKit = createAppKit({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
      networks: NETWORKS_LIST,
      defaultNetwork: NETWORKS_LIST[0],
      adapters: [getWagmiAdapter(), getSolanaAdapter()],
      storage,
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
        name: "WPay",
        description: "WalletConnect Point of Sale",
        url: "https://reown.com/appkit",
        icons: [
          "https://raw.githubusercontent.com/reown-com/react-native-examples/refs/heads/main/dapps/pos-app/assets/images/icon.png",
        ],
      },
    });
  }
  return _appKit;
};

export const wagmiAdapter = getWagmiAdapter();
export const appKit = getAppKit();
