import type { AppKitNetwork } from "@reown/appkit-react-native";
import { ImageSourcePropType } from "react-native";
import {
  arbitrum as arbitrumViem,
  base as baseViem,
  mainnet as mainnetViem,
  optimism as optimismViem,
  polygon as polygonViem,
  sepolia as sepoliaViem,
} from "viem/chains";
export type { CaipNetworkId } from "@reown/appkit-common-react-native";

// ******************** Types ********************
export type TokenKey = "usdc" | "usdt";
export interface Token {
  id: TokenKey;
  icon: ImageSourcePropType;
  symbol: string;
  decimals: number;
  addresses: Record<string, string>;
  standard: Record<string, string>;
}

export type Network = AppKitNetwork & {
  icon?: string;
};

// ******************** Networks ********************
export const mainnet: Network = {
  ...mainnetViem,
  caipNetworkId: "eip155:1",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155_1.png"),
};

export const polygon: Network = {
  ...polygonViem,
  caipNetworkId: "eip155:137",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155_137.png"),
};

export const optimism: Network = {
  ...optimismViem,
  caipNetworkId: "eip155:10",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155_10.png"),
};

export const base: Network = {
  ...baseViem,
  caipNetworkId: "eip155:8453",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155_8453.png"),
};

export const arbitrum: Network = {
  ...arbitrumViem,
  caipNetworkId: "eip155:42161",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155_42161.png"),
};

export const sepolia: Network = {
  ...sepoliaViem,
  caipNetworkId: "eip155:11155111",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155_1.png"),
};

export const solana: Network = {
  id: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  caipNetworkId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  chainNamespace: "solana",
  name: "Solana",
  icon: require("@/assets/images/chains/solana.png"),
  nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
  rpcUrls: {
    default: {
      http: ["https://rpc.walletconnect.org/v1"],
    },
  },
  blockExplorers: { default: { name: "Solscan", url: "https://solscan.io" } },
};

export const solanaDevnet: Network = {
  id: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  caipNetworkId: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  chainNamespace: "solana",
  name: "Solana Devnet",
  icon: require("@/assets/images/chains/solana.png"),
  nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
  rpcUrls: {
    default: { http: ["https://rpc.walletconnect.org/v1"] },
  },
  blockExplorers: { default: { name: "Solscan", url: "https://solscan.io" } },
};

export const ALLOWED_CHAINS: Network[] = [
  mainnet,
  polygon,
  optimism,
  base,
  arbitrum,
  sepolia,
  solana,
  solanaDevnet,
];

export const TOKEN_LIST: Token[] = [
  {
    id: "usdc",
    symbol: "USDC",
    decimals: 6,
    icon: require("@/assets/images/tokens/usdc.png"),
    addresses: {
      "eip155:1": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "eip155:10": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      "eip155:137": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      "eip155:42161": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      "eip155:8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "eip155:11155111": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp":
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1":
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    },
    standard: {
      "eip155:1": "ERC20",
      "eip155:10": "ERC20",
      "eip155:137": "ERC20",
      "eip155:42161": "ERC20",
      "eip155:8453": "ERC20",
      "eip155:11155111": "ERC20",
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "token",
      "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": "token",
    },
  },
  {
    id: "usdt",
    symbol: "USDT",
    icon: require("@/assets/images/tokens/usdt.png"),
    decimals: 6,
    addresses: {
      "eip155:1": "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp":
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    },
    standard: {
      "eip155:1": "ERC20",
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "token",
    },
  },
];

// ******************** Helpers ********************
export const getNetworkByName = (name: string): Network | undefined =>
  ALLOWED_CHAINS.find((network) => network.name === name);

export const getNetworkById = (id: string | number): Network | undefined =>
  ALLOWED_CHAINS.find((network) => String(network.id) === String(id));

export const getNetworkByCaipId = (caipId: string): Network | undefined =>
  ALLOWED_CHAINS.find((network) => network.caipNetworkId === caipId);

export const getAvailableNetworks = (userChainIds: string[]): Network[] =>
  ALLOWED_CHAINS.filter((network) => userChainIds.includes(String(network.id)));

export const getTokenAvailableNetworks = (tokenId: string): Network[] => {
  return ALLOWED_CHAINS.filter((network) => {
    const token = TOKEN_LIST.find((token) => token.id === tokenId);
    return Object.keys(token?.addresses || {}).includes(network.caipNetworkId);
  });
};

export const getTokenById = (id: string): Token | undefined =>
  TOKEN_LIST.find((token) => token.id === id);
