import {
  arbitrum as arbitrumViem,
  base as baseViem,
  mainnet as mainnetViem,
  optimism as optimismViem,
  sepolia as sepoliaViem,
} from "viem/chains";

import type { AppKitNetwork } from "@reown/appkit-react-native";

// ******************** Types ********************
export type NetworkKey = (typeof NETWORKS_LIST)[number]["name"];
export type TokenKey = "usdc" | "usdt";
export interface Token {
  address: string;
  decimals: number;
  standard: string;
  symbol: string;
}

export type Network = AppKitNetwork & {
  tokens: Record<string, Token>;
  icon?: string;
};

// ******************** Networks ********************
const mainnet: Network = {
  id: 1,
  caipNetworkId: "eip155:1",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155-1.png"),
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://eth.merkle.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
  tokens: {
    usdc: {
      address: "0xA0b86a33E6441A8469A53D2b5eE5a6B7bc2c9Beb",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
    usdt: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDT",
    },
  },
};

const optimism: Network = {
  id: 10,
  caipNetworkId: "eip155:10",
  chainNamespace: "eip155",
  icon: require("@/assets/images/chains/eip155-10.png"),
  name: "OP Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.optimism.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Optimism Explorer",
      url: "https://optimistic.etherscan.io",
    },
  },
  tokens: {
    usdc: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
    usdt: {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDT",
    },
  },
};

const base: Network = {
  id: 8453,
  caipNetworkId: "eip155:8453",
  chainNamespace: "eip155",
  name: "Base",
  icon: require("@/assets/images/chains/base.webp"),
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },
  tokens: {
    usdc: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
  },
};

const arbitrum: Network = {
  id: 42161,
  caipNetworkId: "eip155:42161",
  chainNamespace: "eip155",
  name: "Arbitrum",
  icon: require("@/assets/images/chains/arbitrum.webp"),
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://arbiscan.io",
    },
  },
  tokens: {
    usdc: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
    usdt: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDT",
    },
  },
};

const sepolia: Network = {
  id: 11155111,
  caipNetworkId: "eip155:11155111",
  chainNamespace: "eip155",
  name: "Sepolia",
  icon: require("@/assets/images/chains/eip155-1.png"),
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  tokens: {
    usdc: {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
  },
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
  tokens: {
    usdc: {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      standard: "token",
      symbol: "USDC",
    },
  },
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
  tokens: {
    usdc: {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      standard: "token",
      symbol: "USDC",
    },
  },
};

// The same chains must be included in NETWORKS_LIST with the token information
export const WAGMI_NETWORKS_LIST = [
  mainnetViem,
  optimismViem,
  arbitrumViem,
  baseViem,
  sepoliaViem,
] as const;

export const NETWORKS_LIST: Network[] = [
  mainnet,
  optimism,
  arbitrum,
  base,
  sepolia,
  solana,
  solanaDevnet,
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

export const getAvailableTokens = (network: Network): string[] =>
  Object.keys(network.tokens);

export const getTokenData = (
  network: Network,
  tokenKey: string,
): Token | undefined => network.tokens[tokenKey];
