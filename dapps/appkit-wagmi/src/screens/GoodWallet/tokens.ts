/**
 * Mock wallet holdings for the GoodWallet deposit demo — a wallet that natively knows which tokens
 * you hold, per network. Static (no network / keys); mirrors how OmenStore seeds fake state.
 * `priceUsd` converts a token amount into the USD value we credit the Omen account with (stables ≈ 1,
 * native tokens carry realistic mock prices).
 */
export interface WalletToken {
  symbol: string;
  name: string;
  /** Mock balance held, in whole token units. */
  balance: number;
  /** Mock USD price used to convert amounts to a USD credit. */
  priceUsd: number;
  /** Brand color for the token badge. */
  color: string;
}

export interface WalletNetwork {
  /** Display name — must match the BX network names so a pre-selection maps across. */
  name: string;
  /** CAIP-2 id, for the network logo (WalletConnect assets CDN). */
  caip2: string;
  tokens: WalletToken[];
}

const usdc = (balance: number): WalletToken => ({
  symbol: 'USDC',
  name: 'USD Coin',
  balance,
  priceUsd: 1,
  color: '#2775CA',
});
const usdt = (balance: number): WalletToken => ({
  symbol: 'USDT',
  name: 'Tether',
  balance,
  priceUsd: 1,
  color: '#26A17B',
});
const dai = (balance: number): WalletToken => ({
  symbol: 'DAI',
  name: 'Dai',
  balance,
  priceUsd: 1,
  color: '#F5AC37',
});
const eth = (balance: number): WalletToken => ({
  symbol: 'ETH',
  name: 'Ethereum',
  balance,
  priceUsd: 3550,
  color: '#627EEA',
});
const pol = (balance: number): WalletToken => ({
  symbol: 'POL',
  name: 'Polygon',
  balance,
  priceUsd: 0.52,
  color: '#8247E5',
});

export const WALLET_NETWORKS: WalletNetwork[] = [
  {name: 'Base', caip2: 'eip155:8453', tokens: [usdc(1240.55), eth(0.842), usdt(300)]},
  {name: 'Ethereum', caip2: 'eip155:1', tokens: [usdc(860.2), eth(1.35), dai(410)]},
  {name: 'Polygon', caip2: 'eip155:137', tokens: [usdc(540), pol(1250)]},
  {name: 'Arbitrum', caip2: 'eip155:42161', tokens: [usdc(920.75), eth(0.21)]},
  {name: 'Optimism', caip2: 'eip155:10', tokens: [usdc(305.2), eth(0.16)]},
];

export function usdValue(token: WalletToken, amount: number): number {
  return Math.round(token.priceUsd * amount * 100) / 100;
}

/** Network logo from the WalletConnect assets CDN (same source BX uses). */
export function networkImageUrl(caip2: string): string {
  return `https://api.walletconnect.com/assets/v1/image/network/${encodeURIComponent(caip2)}/md`;
}
