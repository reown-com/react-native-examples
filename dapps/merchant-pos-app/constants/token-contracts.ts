import { NetworkId } from "./networks";

export interface ContractToken {
  address: string;
  symbol: string;
}

/**
 * Settlement-token contracts per chain (CAIP-2 prefix → token list with symbols).
 *
 * EVM addresses sourced as in dashboard-new's create-test-merchant:
 *  - USDC:  https://developers.circle.com/stablecoins/usdc-contract-addresses
 *  - PYUSD: https://etherscan.io/address/0x6c3ea9036406852006290770bedfcaba0e23a0e8
 *  - USDG:  https://etherscan.io/address/0xe343167631d89b6ffc58b88d6b7fb0228795491d
 * Solana mints (mainnet):
 *  - USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 *  - USDT: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
 */
export const CONTRACTS: Record<string, ContractToken[]> = {
  // Ethereum mainnet
  "eip155:1": [
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" },
    { address: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8", symbol: "PYUSD" },
    { address: "0xe343167631d89B6Ffc58B88d6b7fB0228795491D", symbol: "USDG" },
  ],
  "eip155:10": [
    { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC" },
  ],
  "eip155:137": [
    { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC" },
  ],
  "eip155:8453": [
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC" },
  ],
  "eip155:42161": [
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC" },
  ],
  "eip155:42220": [
    { address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", symbol: "USDC" },
  ],
  "eip155:143": [
    { address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", symbol: "USDC" },
  ],
  // Solana mainnet
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": [
    {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      symbol: "USDC",
    },
    {
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      symbol: "USDT",
    },
  ],
};

function assetNamespace(chainPrefix: string): "erc20" | "token" {
  return chainPrefix.startsWith("eip155:") ? "erc20" : "token";
}

/** All chain prefixes (CAIP-2) for a given namespace. */
export function chainsForNamespace(namespace: NetworkId): string[] {
  return Object.keys(CONTRACTS).filter((k) => k.startsWith(`${namespace}:`));
}

/** CAIP-10 account id for a chain prefix + bare address (e.g. `eip155:1:0x…`). */
export function caip10ForChain(chainPrefix: string, address: string): string {
  return `${chainPrefix}:${address}`;
}

/**
 * CAIP-19 asset ids for the settlement tokens configured on this chain,
 * optionally filtered to a set of symbols (e.g. only the ones the merchant
 * picked during onboarding). Empty array for unknown chains.
 */
export function getTokensCaip19(
  chainPrefix: string,
  allowedSymbols?: Set<string>,
): string[] {
  const tokens = CONTRACTS[chainPrefix];
  if (!tokens || tokens.length === 0) return [];
  const ns = assetNamespace(chainPrefix);
  return tokens
    .filter((t) => !allowedSymbols || allowedSymbols.has(t.symbol))
    .map((t) => `${chainPrefix}/${ns}:${t.address}`);
}

/** Unique token symbols available across every chain in a given namespace. */
export function symbolsForNamespace(namespace: NetworkId): string[] {
  const set = new Set<string>();
  for (const chainPrefix of chainsForNamespace(namespace)) {
    for (const t of CONTRACTS[chainPrefix] ?? []) set.add(t.symbol);
  }
  return Array.from(set);
}
