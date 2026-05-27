import { Brand } from "./theme";

export type NetworkId = "eip155" | "solana";

export interface NetworkConfig {
  id: NetworkId;
  name: string;
  subtitle: string;
  /** Accent color for badges / scope pills. */
  color: string;
  /** Whether this is a gradient (Solana). */
  gradient?: { from: string; to: string };
}

export const NETWORKS: NetworkConfig[] = [
  {
    id: "eip155",
    name: "Ethereum",
    subtitle: "EVM-compatible",
    color: Brand.ethereum,
  },
  {
    id: "solana",
    name: "Solana",
    subtitle: "High-speed, low fees",
    color: Brand.solanaFrom,
    gradient: { from: Brand.solanaFrom, to: Brand.solanaTo },
  },
];

export function getNetwork(id: NetworkId): NetworkConfig {
  return NETWORKS.find((n) => n.id === id) ?? NETWORKS[0];
}

export type TokenSymbol = "USDC" | "USDT" | "ETH" | "DAI" | "SOL";

export interface TokenConfig {
  /** Unique id, namespaced by network: e.g. `eip155:USDC`. */
  id: string;
  network: NetworkId;
  symbol: TokenSymbol;
  name: string;
  color: string;
  glyph: string;
}

export const TOKENS: TokenConfig[] = [
  // Ethereum
  {
    id: "eip155:USDC",
    network: "eip155",
    symbol: "USDC",
    name: "USD Coin",
    color: Brand.usdc,
    glyph: "$",
  },
  {
    id: "eip155:USDT",
    network: "eip155",
    symbol: "USDT",
    name: "Tether USD",
    color: Brand.usdt,
    glyph: "₮",
  },
  {
    id: "eip155:ETH",
    network: "eip155",
    symbol: "ETH",
    name: "Ether",
    color: Brand.ethereum,
    glyph: "Ξ",
  },
  {
    id: "eip155:DAI",
    network: "eip155",
    symbol: "DAI",
    name: "Dai",
    color: Brand.dai,
    glyph: "◈",
  },
  // Solana
  {
    id: "solana:USDC",
    network: "solana",
    symbol: "USDC",
    name: "USD Coin",
    color: Brand.usdc,
    glyph: "$",
  },
  {
    id: "solana:USDT",
    network: "solana",
    symbol: "USDT",
    name: "Tether USD",
    color: Brand.usdt,
    glyph: "₮",
  },
  {
    id: "solana:SOL",
    network: "solana",
    symbol: "SOL",
    name: "Solana",
    color: Brand.solanaFrom,
    glyph: "◎",
  },
];

export function tokensForNetwork(network: NetworkId): TokenConfig[] {
  return TOKENS.filter((t) => t.network === network);
}

/** Tokens selected by default during onboarding (the stablecoins). */
export const DEFAULT_TOKEN_IDS = TOKENS.filter(
  (t) => t.symbol === "USDC" || t.symbol === "USDT",
).map((t) => t.id);
