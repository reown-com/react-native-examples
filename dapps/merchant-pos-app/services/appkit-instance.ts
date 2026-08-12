import { appkitStorage } from "@/utils/appkit-storage";
import { createAppKit, solana } from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { arbitrum, base, mainnet, polygon } from "@wagmi/core/chains";
import * as Clipboard from "expo-clipboard";

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("EXPO_PUBLIC_PROJECT_ID is not available");
}

const metadata = {
  name: "Merchant POS",
  description: "Accept crypto payments. Settle to your wallet.",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "merchantpos://",
    universal: "",
  },
};

export const EVM_NETWORKS = [mainnet, polygon, arbitrum, base];
export const SOLANA_NETWORKS = [solana];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  networks: EVM_NETWORKS as any,
});

const solanaAdapter = new SolanaAdapter();

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  },
};

export const appkit = createAppKit({
  projectId,
  networks: [...EVM_NETWORKS, solana],
  adapters: [wagmiAdapter, solanaAdapter],
  metadata,
  clipboardClient,
  storage: appkitStorage,
  defaultNetwork: mainnet,
  enableAnalytics: true,
});
