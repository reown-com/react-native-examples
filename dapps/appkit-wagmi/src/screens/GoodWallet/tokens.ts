/**
 * Mock token holdings for the GoodWallet deposit demo — a wallet that natively knows which tokens
 * you hold. Static (no network / keys); mirrors how OmenStore seeds fake state. `priceUsd` converts
 * a token amount into the USD value we credit the Omen account with.
 */
export interface Token {
  symbol: string;
  name: string;
  /** Mock balance held, in whole token units. */
  balance: number;
  /** Mock USD price used to convert the deposit amount into a USD credit. */
  priceUsd: number;
  /** Brand color for the token badge. */
  color: string;
}

export const TOKENS: Token[] = [
  {symbol: 'USDC', name: 'USD Coin', balance: 1240.55, priceUsd: 1, color: '#2775CA'},
  {symbol: 'ETH', name: 'Ethereum', balance: 0.842, priceUsd: 3550, color: '#627EEA'},
  {symbol: 'USDT', name: 'Tether', balance: 620, priceUsd: 1, color: '#26A17B'},
  {symbol: 'DAI', name: 'Dai', balance: 305.2, priceUsd: 1, color: '#F5AC37'},
];

export function usdValue(token: Token, amount: number): number {
  return Math.round(token.priceUsd * amount * 100) / 100;
}
