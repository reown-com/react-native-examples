import { NetworkId } from "@/constants/networks";
import {
  caip10ForChain,
  chainsForNamespace,
  getTokensCaip19,
} from "@/constants/token-contracts";
import { ApiError } from "@/utils/types";
import {
  clearPayCoreCognitoTokenCache,
  getPayCoreCognitoToken,
} from "./cognito-auth";

const PAY_CORE_API_URL = process.env.EXPO_PUBLIC_PAY_CORE_API_URL;

export interface CryptoSettlement {
  caip10: string;
  caip19: string;
  mta: boolean;
  type: string;
}

export interface MerchantProviders {
  iron: null;
  turnkey: {
    mtaAddresses: string[];
    organizationId: string;
  } | null;
}

/** Mirrors pay-core's MerchantUpsertRequest (see walletconnect-apps dashboard). */
export interface MerchantUpsertRequest {
  alwaysCollectData: boolean;
  createdAt: string;
  cryptoSettlements: CryptoSettlement[];
  deleted: boolean;
  fees: null;
  iconUrl?: string;
  id: string;
  name: string;
  neverCollectData: boolean;
  partnerId: string;
  providers: MerchantProviders;
  updatedAt: string;
  version: number;
}

export interface MerchantResponse {
  id: string;
  name: string;
  iconUrl?: string;
  partnerId: string;
  cryptoSettlements: CryptoSettlement[];
  fees: null;
  providers: MerchantProviders;
  alwaysCollectData: boolean;
  neverCollectData: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

function isRetriableStatus(status: number): boolean {
  // 401 is retriable (token refresh), 5xx are retriable.
  return status === 401 || status >= 500;
}

async function putMerchant(
  request: MerchantUpsertRequest,
  retryOn401 = true,
): Promise<void> {
  if (!PAY_CORE_API_URL) {
    throw new Error(
      "EXPO_PUBLIC_PAY_CORE_API_URL is not set — required to upsert the merchant.",
    );
  }

  const url = `${PAY_CORE_API_URL.replace(/\/+$/, "")}/v2/internal/merchant`;
  const token = await getPayCoreCognitoToken();

  if (__DEV__) {
    console.log(
      `[merchant-api] → PUT ${url} id=${request.id} v${request.version}`,
    );
    console.log("request", JSON.stringify(request, null, 2));
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (response.status === 204) {
    if (__DEV__) console.log(`[merchant-api] ✓ 204 ${request.id}`);
    return;
  }

  if (response.status === 401 && retryOn401) {
    if (__DEV__) console.log(`[merchant-api] 401 — clearing token, retrying`);
    clearPayCoreCognitoTokenCache();
    return putMerchant(request, false);
  }

  const text = await response.text().catch(() => "");
  if (__DEV__) {
    console.warn(`[merchant-api] ✗ ${response.status} ${url} — ${text}`);
  }
  const error: ApiError = {
    message: `Merchant upsert failed (${response.status}): ${text || response.statusText}`,
    status: response.status,
    code: isRetriableStatus(response.status) ? "RETRIABLE" : undefined,
  };
  throw error;
}

/**
 * PUT /v2/internal/merchant on pay-core. Mints a Cognito access token via
 * client_credentials (cached for 50 min) and retries once on 401.
 */
export async function upsertMerchant(
  request: MerchantUpsertRequest,
): Promise<void> {
  return putMerchant(request, true);
}

/**
 * GET the current pay-core merchant state. Returns `null` on 404 (no merchant
 * yet). Used to source the next upsert's `version` + `createdAt` so the server
 * actually applies the update.
 */
export async function getMerchant(
  merchantId: string,
  retryOn401 = true,
): Promise<MerchantResponse | null> {
  if (!PAY_CORE_API_URL) {
    throw new Error(
      "EXPO_PUBLIC_PAY_CORE_API_URL is not set — required to fetch the merchant.",
    );
  }
  const url = `${PAY_CORE_API_URL.replace(/\/+$/, "")}/v2/internal/merchant/${encodeURIComponent(merchantId)}`;
  const token = await getPayCoreCognitoToken();
  if (__DEV__) console.log(`[merchant-api] → GET ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.ok) {
    const data = (await response.json()) as MerchantResponse;
    if (__DEV__) {
      console.log(`[merchant-api] ✓ GET 200 v${data.version} ${merchantId}`);
    }
    return data;
  }
  if (response.status === 404) {
    if (__DEV__) console.log(`[merchant-api] GET 404 — no merchant yet`);
    return null;
  }
  if (response.status === 401 && retryOn401) {
    clearPayCoreCognitoTokenCache();
    return getMerchant(merchantId, false);
  }
  const text = await response.text().catch(() => "");
  if (__DEV__) {
    console.warn(`[merchant-api] ✗ GET ${response.status} ${url} — ${text}`);
  }
  throw {
    message: `Merchant fetch failed (${response.status}): ${text || response.statusText}`,
    status: response.status,
  } satisfies ApiError;
}

/**
 * Expand a per-namespace address map into cryptoSettlements + mtaAddresses by
 * iterating every chain in CONTRACTS for that namespace and every token
 * configured on that chain. `mta` is `true` for EVM entries (Solana isn't an
 * MTA in pay-core).
 */
export function buildCryptoSettlements(
  addresses: Partial<Record<NetworkId, string>>,
): { cryptoSettlements: CryptoSettlement[]; mtaAddresses: string[] } {
  const mtaAddresses: string[] = [];
  const cryptoSettlements: CryptoSettlement[] = [];
  (Object.keys(addresses) as NetworkId[]).forEach((namespace) => {
    const address = addresses[namespace];
    if (!address) return;
    const isMta = namespace === "eip155";
    for (const chainPrefix of chainsForNamespace(namespace)) {
      const caip10 = caip10ForChain(chainPrefix, address);
      if (isMta) mtaAddresses.push(caip10);
      for (const caip19 of getTokensCaip19(chainPrefix)) {
        cryptoSettlements.push({
          caip10,
          caip19,
          mta: isMta,
          type: "caip19",
        });
      }
    }
  });
  return { cryptoSettlements, mtaAddresses };
}

interface SyncMerchantParams {
  merchantId: string;
  partnerId: string;
  companyName: string;
  iconUrl?: string;
  addresses: Partial<Record<NetworkId, string>>;
}

/**
 * Build the MerchantUpsertRequest from a high-level set of inputs and PUT it
 * to pay-core. Used both at onboarding finish and when a different wallet
 * connects against an existing install merchant (the addresses change, the
 * merchant id stays).
 *
 * Sources `version` and `createdAt` from the server (`getMerchant`) so the
 * upsert always carries `serverVersion + 1` — sending a stale local version
 * is ignored by pay-core.
 */
export async function syncMerchantToPayCore(
  params: SyncMerchantParams,
): Promise<{ version: number }> {
  const existing = await getMerchant(params.merchantId);
  const now = new Date().toISOString();
  const version = (existing?.version ?? 0) + 1;
  const createdAt = existing?.createdAt ?? now;

  const { cryptoSettlements, mtaAddresses } = buildCryptoSettlements(
    params.addresses,
  );

  await upsertMerchant({
    id: params.merchantId,
    name: params.companyName || "Merchant",
    iconUrl: params.iconUrl,
    partnerId: params.partnerId,
    cryptoSettlements,
    providers: {
      iron: null,
      // Turnkey provider hosts EVM MTAs; omit when no EVM address is present.
      turnkey:
        mtaAddresses.length > 0
          ? { mtaAddresses, organizationId: params.merchantId }
          : null,
    },
    alwaysCollectData: false,
    neverCollectData: false,
    deleted: false,
    fees: null,
    createdAt,
    updatedAt: now,
    version,
  });

  return { version };
}
