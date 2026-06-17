const RPC_URL = "https://rpc.walletconnect.org/v1";
const PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID ?? "";

export interface TokenBalance {
  name: string;
  symbol: string;
  chainId: string;
  address?: string;
  value?: number;
  price?: number;
  quantity: { decimals: string; numeric: string };
  iconUrl?: string;
}

export interface Portfolio {
  total: number;
  tokens: TokenBalance[];
}

export async function fetchPortfolio(address: string): Promise<Portfolio> {
  if (!PROJECT_ID) throw new Error("EXPO_PUBLIC_PROJECT_ID is not configured");

  // Demo only — uses a fixed account; a real app must not expose user wallet
  // addresses in URLs (they end up in server/CDN/proxy access logs).
  const url = `${RPC_URL}/account/${address}/balance?projectId=${PROJECT_ID}&currency=usd`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "x-sdk-type": "appkit", "x-sdk-version": "secure-site" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) throw new Error(`Balance request failed (status ${res.status})`);

  const data = (await res.json()) as { balances?: TokenBalance[] };
  const all = data.balances ?? [];
  const tokens = all
    .filter((t) => typeof t.value === "number" && t.value > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const total = tokens.reduce((sum, t) => sum + (t.value ?? 0), 0);
  return { total, tokens };
}
