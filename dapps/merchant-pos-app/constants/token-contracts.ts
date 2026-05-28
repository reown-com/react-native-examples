import { NetworkId } from "./networks";

/**
 * Settlement-token contracts per chain (CAIP-2 prefix → addresses).
 *
 * EVM addresses sourced as in dashboard-new's create-test-merchant:
 *  - USDC:  https://developers.circle.com/stablecoins/usdc-contract-addresses
 *  - PYUSD: https://etherscan.io/address/0x6c3ea9036406852006290770bedfcaba0e23a0e8
 *  - USDG:  https://etherscan.io/address/0xe343167631d89b6ffc58b88d6b7fb0228795491d
 * Solana mints (mainnet):
 *  - USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 *  - USDT: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
 */
export const CONTRACTS: Record<string, string[]> = {
  // Ethereum mainnet
  "eip155:1": [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8", // PYUSD
    "0xe343167631d89B6Ffc58B88d6b7fB0228795491D", // USDG
  ],
  "eip155:10": ["0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"], // Optimism USDC
  "eip155:137": ["0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"], // Polygon USDC
  "eip155:8453": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"], // Base USDC
  "eip155:42161": ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831"], // Arbitrum USDC
  "eip155:42220": ["0xcebA9300f2b948710d2653dD7B07f33A8B32118C"], // Celo USDC
  "eip155:143": ["0x754704Bc059F8C67012fEd69BC8A327a5aafb603"], // Monad USDC
  // Solana mainnet
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
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
 * CAIP-19 asset ids for the settlement tokens configured on this chain.
 * Returns an empty array for unknown chains.
 */
export function getTokensCaip19(chainPrefix: string): string[] {
  const tokens = CONTRACTS[chainPrefix];
  if (!tokens || tokens.length === 0) return [];
  const ns = assetNamespace(chainPrefix);
  return tokens.map((addr) => `${chainPrefix}/${ns}:${addr}`);
}
