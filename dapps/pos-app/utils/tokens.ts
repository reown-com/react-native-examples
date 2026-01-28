/**
 * Token utilities for parsing CAIP-19 identifiers and formatting token amounts
 */

/**
 * Known token contract addresses mapped to their symbols and decimals
 * Format: { [chainId]: { [contractAddress]: { symbol, decimals } } }
 */
const KNOWN_TOKENS: Record<
  string,
  Record<string, { symbol: string; decimals: number }>
> = {
  // Ethereum Mainnet
  "1": {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
      symbol: "USDC",
      decimals: 6,
    },
    "0xdac17f958d2ee523a2206206994597c13d831ec7": {
      symbol: "USDT",
      decimals: 6,
    },
  },
  // Base
  "8453": {
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
      symbol: "USDC",
      decimals: 6,
    },
  },
  // Arbitrum
  "42161": {
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831": {
      symbol: "USDC",
      decimals: 6,
    },
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": {
      symbol: "USDT",
      decimals: 6,
    },
  },
  // Polygon
  "137": {
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": {
      symbol: "USDC",
      decimals: 6,
    },
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": {
      symbol: "USDT",
      decimals: 6,
    },
  },
  // Optimism
  "10": {
    "0x0b2c639c533813f4aa9d7837caf62653d097ff85": {
      symbol: "USDC",
      decimals: 6,
    },
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": {
      symbol: "USDT",
      decimals: 6,
    },
  },
};

export interface TokenInfo {
  symbol: string;
  decimals: number;
  chainId: string;
  contractAddress: string;
}

/**
 * Parse a CAIP-19 token identifier
 * Format: eip155:{chainId}/erc20:{contractAddress}
 * @param caip19 - The CAIP-19 identifier
 * @returns Parsed token info or null if invalid/unknown
 */
export function parseTokenCaip19(caip19?: string): TokenInfo | null {
  if (!caip19) return null;

  // Parse format: eip155:{chainId}/erc20:{contractAddress}
  const match = caip19.match(/^eip155:(\d+)\/erc20:(.+)$/i);
  if (!match) return null;

  const chainId = match[1];
  const contractAddress = match[2].toLowerCase();

  const chainTokens = KNOWN_TOKENS[chainId];
  if (!chainTokens) return null;

  const tokenInfo = chainTokens[contractAddress];
  if (!tokenInfo) return null;

  return {
    symbol: tokenInfo.symbol,
    decimals: tokenInfo.decimals,
    chainId,
    contractAddress,
  };
}

/**
 * Format a raw token amount with proper decimals
 * @param rawAmount - The raw amount string (e.g., "100000")
 * @param decimals - Number of decimals (e.g., 6 for USDC)
 * @returns Formatted amount string (e.g., "0.10")
 */
export function formatTokenAmount(rawAmount: string, decimals: number): string {
  if (!rawAmount) return "0";

  // Handle the raw amount as a string to avoid precision issues
  const paddedAmount = rawAmount.padStart(decimals + 1, "0");
  const integerPart = paddedAmount.slice(0, -decimals) || "0";
  const decimalPart = paddedAmount.slice(-decimals);

  // Format integer part with commas using regex to avoid precision loss
  const formattedInteger =
    integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";

  // Trim trailing zeros from decimal part but keep at least 2 decimals
  let trimmedDecimal = decimalPart.replace(/0+$/, "");
  if (trimmedDecimal.length < 2) {
    trimmedDecimal = decimalPart.slice(0, 2);
  }

  return `${formattedInteger}.${trimmedDecimal}`;
}

/**
 * Format crypto received display string from token_caip19 and token_amount
 * @param tokenCaip19 - CAIP-19 identifier (e.g., "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
 * @param tokenAmount - Raw amount string (e.g., "100000")
 * @returns Formatted display string (e.g., "0.10 USDC") or null if unknown token
 */
export function formatCryptoReceived(
  tokenCaip19?: string,
  tokenAmount?: string,
): string | null {
  const tokenInfo = parseTokenCaip19(tokenCaip19);
  if (!tokenInfo || !tokenAmount) return null;

  const formattedAmount = formatTokenAmount(tokenAmount, tokenInfo.decimals);
  return `${formattedAmount} ${tokenInfo.symbol}`;
}

/**
 * Get the token symbol from a CAIP-19 identifier
 * @param tokenCaip19 - CAIP-19 identifier
 * @returns Token symbol (e.g., "USDC") or null if unknown
 */
export function getTokenSymbol(tokenCaip19?: string): string | null {
  const tokenInfo = parseTokenCaip19(tokenCaip19);
  return tokenInfo?.symbol ?? null;
}
