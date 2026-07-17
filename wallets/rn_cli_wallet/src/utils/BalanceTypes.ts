export interface TokenBalance {
  name: string;
  symbol: string;
  chainId: string; // e.g., "eip155:1"
  address?: string; // Token contract address (CAIP format)
  value: number; // USD value
  price: number;
  quantity: {
    decimals: string;
    numeric: string;
  };
  iconUrl?: string;
  // True when the balance API request for this chain failed, so the amount is
  // unknown (shown as "~") rather than a confirmed 0.
  balanceUnavailable?: boolean;
}

export interface BalanceResponse {
  balances: TokenBalance[];
}
