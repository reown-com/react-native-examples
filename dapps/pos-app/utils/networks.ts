import {
  arbitrum as arbitrumViem,
  base as baseViem,
  Chain,
  mainnet as mainnetViem,
  optimism as optimismViem,
  polygon as polygonViem,
  sepolia as sepoliaViem,
} from "viem/chains";

import type { AppKitNetwork } from "@reown/appkit-react-native";

// ******************** Types ********************
export type TokenKey = "usdc" | "usdt";
export interface Token {
  id: TokenKey;
  icon: string;
  symbol: string;
  decimals: number;
  addresses: Record<string, string>;
  standard: Record<string, string>;
}

export type Network = AppKitNetwork & {
  icon?: string;
};

// ******************** Networks ********************
const mainnet: Network = {
  ...mainnetViem,
  caipNetworkId: "eip155:1",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155-1.png"),
};

const polygon: Network = {
  ...polygonViem,
  caipNetworkId: "eip155:137",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155-137.png"),
};

const optimism: Network = {
  ...optimismViem,
  caipNetworkId: "eip155:10",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155-10.png"),
};

const base: Network = {
  ...baseViem,
  caipNetworkId: "eip155:8453",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/base.webp"),
};

const arbitrum: Network = {
  ...arbitrumViem,
  caipNetworkId: "eip155:42161",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/arbitrum.webp"),
};

const sepolia: Network = {
  ...sepoliaViem,
  caipNetworkId: "eip155:11155111",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155-1.png"),
};

const solana: Network = {
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

const solanaDevnet: Network = {
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

export const WAGMI_NETWORKS_LIST = [
  mainnet as Chain,
  polygon as Chain,
  optimism as Chain,
  arbitrum as Chain,
  base as Chain,
  sepolia as Chain,
] as readonly [Chain, ...Chain[]];

export const NETWORKS_LIST: Network[] = [
  ...(WAGMI_NETWORKS_LIST as unknown as Network[]),
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
      "eip155:1": "0xA0b86a33E6441A8469A53D2b5eE5a6B7bc2c9Beb",
      "eip155:10": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      "eip155:42161": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      "eip155:8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "eip155:11155111": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp":
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1":
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    standard: {
      "eip155:1": "ERC20",
      "eip155:10": "ERC20",
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
      "eip155:1": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "eip155:10": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      "eip155:42161": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    },
    standard: {
      "eip155:1": "ERC20",
      "eip155:10": "ERC20",
      "eip155:42161": "ERC20",
    },
  },
];

// ******************** Helpers ********************
export const getNetworkByName = (name: string): Network | undefined =>
  NETWORKS_LIST.find((network) => network.name === name);

export const getNetworkById = (id: string | number): Network | undefined =>
  NETWORKS_LIST.find((network) => String(network.id) === String(id));

export const getNetworkByCaipId = (caipId: string): Network | undefined =>
  NETWORKS_LIST.find((network) => network.caipNetworkId === caipId);

export const getAvailableNetworks = (userChainIds: string[]): Network[] =>
  NETWORKS_LIST.filter((network) => userChainIds.includes(String(network.id)));

export const getTokenAvailableNetworks = (tokenId: string): Network[] => {
  return NETWORKS_LIST.filter((network) => {
    const token = TOKEN_LIST.find((token) => token.id === tokenId);
    return Object.keys(token?.addresses || {}).includes(network.caipNetworkId);
  });
};

export const getTokenById = (id: string): Token | undefined =>
  TOKEN_LIST.find((token) => token.id === id);
