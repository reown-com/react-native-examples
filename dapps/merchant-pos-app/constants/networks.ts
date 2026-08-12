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

export type TokenSymbol = "USDC" | "USDT" | "PYUSD" | "USDG";

export interface TokenConfig {
  /** Unique id, namespaced by network: e.g. `eip155:USDC`. */
  id: string;
  network: NetworkId;
  symbol: TokenSymbol;
  name: string;
  color: string;
  glyph: string;
}

/**
 * Tokens shown as chips during onboarding. The set mirrors what's actually
 * settleable in `constants/token-contracts.ts#CONTRACTS` so the user's
 * selection drives the pay-core upsert one-to-one.
 */
export const TOKENS: TokenConfig[] = [
  // Ethereum (mainnet contracts; USDC is also auto-included on other EVM chains)
  {
    id: "eip155:USDC",
    network: "eip155",
    symbol: "USDC",
    name: "USD Coin",
    color: Brand.usdc,
    glyph: "$",
  },
  {
    id: "eip155:PYUSD",
    network: "eip155",
    symbol: "PYUSD",
    name: "PayPal USD",
    color: Brand.pyusd,
    glyph: "$",
  },
  {
    id: "eip155:USDG",
    network: "eip155",
    symbol: "USDG",
    name: "Global Dollar",
    color: Brand.usdg,
    glyph: "$",
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
];

export function tokensForNetwork(network: NetworkId): TokenConfig[] {
  return TOKENS.filter((t) => t.network === network);
}

/** Tokens selected by default during onboarding (every supported one). */
export const DEFAULT_TOKEN_IDS = TOKENS.map((t) => t.id);
