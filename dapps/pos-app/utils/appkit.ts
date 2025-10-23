import "@walletconnect/react-native-compat";

import { createAppKit, solana } from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";

// You can use 'viem/chains' or define your own chains using `AppKitNetwork` type. Check Options/networks for more detailed info
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "viem/chains";
import { storage } from "./storage";

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID!;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, polygon, arbitrum, optimism, base, sepolia],
});

const solanaAdapter = new SolanaAdapter();

export const networks = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  sepolia,
  solana,
];

export const appKit = createAppKit({
  projectId,
  networks,
  defaultNetwork: mainnet,
  adapters: [wagmiAdapter, solanaAdapter],
  storage,
  metadata: {
    name: "Mobile POS Terminal",
    description: "Mobile POS terminal for crypto payments",
    url: "https://reown.com/appkit",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
});
