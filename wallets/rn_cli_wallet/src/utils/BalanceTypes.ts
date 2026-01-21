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
  iconUrl: string;
}

export interface BalanceResponse {
  balances: TokenBalance[];
}
