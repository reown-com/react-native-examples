import { NetworkId } from "@/constants/networks";
import {
  caip10ForChain,
  chainsForNamespace,
  getTokensCaip19,
} from "@/constants/token-contracts";
import { v4 as uuidv4 } from "uuid";
import { apiClient, getMerchantManagementHeaders } from "./client";

/**
 * Merchant + settlement management against the public WalletConnect Pay REST
 * API (https://api.pay.walletconnect.com/v1). Authed by the partner-scoped
 * customer Api-Key — no Cognito, no internal pay-core upsert.
 *
 *   POST   /merchants                              create a merchant
 *   GET    /merchants/{id}/settlements             list fiat + crypto settlements
 *   POST   /merchants/{id}/settlements/crypto      add crypto settlements
 *   PUT    /merchants/{id}/settlements/crypto/{id} change a settlement destination
 *   DELETE /merchants/{id}/settlements/crypto/{id} remove a settlement
 */

/** A crypto settlement as the API represents it: CAIP-19 asset → CAIP-10 destination. */
export interface CryptoSettlementInput {
  /** CAIP-19 token id, e.g. `eip155:8453/erc20:0x833589…`. */
  asset: string;
  /** CAIP-10 account, e.g. `eip155:8453:0x1234…` (chain must match the asset's). */
  destination: string;
}

export interface CryptoSettlement extends CryptoSettlementInput {
  /** Server settlement id, e.g. `crypto_Xk7nWp8…`. */
  id: string;
}

interface CreateMerchantResponse {
  merchant: {
    id: string;
    name: string;
    email: string | null;
    status: "active" | "inactive" | "suspended";
    createdAt: string;
  };
}

interface SettlementsResponse {
  fiat: { id: string; status: string; bankType: string }[];
  crypto: CryptoSettlement[];
}

interface CreateCryptoSettlementsResponse {
  settlements: CryptoSettlement[];
}

/**
 * Create a merchant. Returns the server-assigned id (`mrch_…`) used as the
 * Merchant-Id on every subsequent payment + settlement call. A fresh
 * Idempotency-Key is minted per attempt so a transport-level retry won't create
 * a duplicate; cross-run dedup is handled by the caller (only create when no
 * merchant exists locally).
 *
 * `iconUrl` is intentionally omitted: the onboarding logo is a local `file://`
 * URI and the API requires an HTTPS URL.
 */
export async function createMerchant(params: {
  name: string;
  email: string;
}): Promise<{ id: string }> {
  const res = await apiClient.post<CreateMerchantResponse>(
    "/merchants",
    {
      merchantName: params.name || "Merchant",
      merchantEmail: params.email,
    },
    { headers: getMerchantManagementHeaders(uuidv4()) },
  );
  return { id: res.merchant.id };
}

/**
 * Map a list of selected token ids (`<namespace>:<SYMBOL>`) into a per-namespace
 * Set of symbols, used to filter settlements down to what the merchant actually
 * chose during onboarding.
 */
function symbolsByNamespace(
  tokens?: string[],
): Partial<Record<NetworkId, Set<string>>> {
  if (!tokens || tokens.length === 0) return {};
  const out: Partial<Record<NetworkId, Set<string>>> = {};
  for (const id of tokens) {
    const [ns, symbol] = id.split(":");
    if (!symbol) continue;
    if (ns !== "eip155" && ns !== "solana") continue;
    const set = out[ns] ?? new Set<string>();
    set.add(symbol);
    out[ns] = set;
  }
  return out;
}

/**
 * Expand a per-namespace settlement address map into the API's
 * `{ asset, destination }` pairs by iterating every chain in CONTRACTS for that
 * namespace and every token configured on that chain. When `tokens` is
 * provided, only tokens whose symbol appears in the merchant's selection are
 * included.
 */
export function buildCryptoSettlements(
  addresses: Partial<Record<NetworkId, string>>,
  tokens?: string[],
): CryptoSettlementInput[] {
  const allowed = symbolsByNamespace(tokens);
  const settlements: CryptoSettlementInput[] = [];
  (Object.keys(addresses) as NetworkId[]).forEach((namespace) => {
    const address = addresses[namespace];
    if (!address) return;
    const allowedSymbols = allowed[namespace];
    for (const chainPrefix of chainsForNamespace(namespace)) {
      const destination = caip10ForChain(chainPrefix, address);
      for (const asset of getTokensCaip19(chainPrefix, allowedSymbols)) {
        settlements.push({ asset, destination });
      }
    }
  });
  return settlements;
}

/** GET the merchant's current crypto settlements (empty array if none). */
export async function getCryptoSettlements(
  merchantId: string,
): Promise<CryptoSettlement[]> {
  const res = await apiClient.get<SettlementsResponse>(
    `/merchants/${encodeURIComponent(merchantId)}/settlements`,
    { headers: getMerchantManagementHeaders() },
  );
  return res.crypto ?? [];
}

/** POST one or more new crypto settlements (the API rejects duplicate assets). */
async function addCryptoSettlements(
  merchantId: string,
  settlements: CryptoSettlementInput[],
): Promise<void> {
  if (settlements.length === 0) return;
  await apiClient.post<CreateCryptoSettlementsResponse>(
    `/merchants/${encodeURIComponent(merchantId)}/settlements/crypto`,
    { settlements },
    { headers: getMerchantManagementHeaders(uuidv4()) },
  );
}

/** PUT a single settlement to point its asset at a new destination. */
async function updateCryptoSettlement(
  merchantId: string,
  settlementId: string,
  destination: string,
): Promise<void> {
  await apiClient.put(
    `/merchants/${encodeURIComponent(merchantId)}/settlements/crypto/${encodeURIComponent(settlementId)}`,
    { destination },
    { headers: getMerchantManagementHeaders(uuidv4()) },
  );
}

/** DELETE a single settlement. */
async function deleteCryptoSettlement(
  merchantId: string,
  settlementId: string,
): Promise<void> {
  await apiClient.delete(
    `/merchants/${encodeURIComponent(merchantId)}/settlements/crypto/${encodeURIComponent(settlementId)}`,
    { headers: getMerchantManagementHeaders() },
  );
}

/**
 * Reconcile the merchant's crypto settlements to match `desired`, diffing by
 * asset (each (merchant, asset) pair is unique server-side):
 *   - asset in desired but not current        → POST (added in one batch)
 *   - asset in both, destination changed       → PUT  (re-point destination)
 *   - asset in current but not desired         → DELETE
 *
 * Drives both first-time onboarding (current is empty → everything is added)
 * and wallet switch (addresses change → destinations are re-pointed).
 */
export async function syncCryptoSettlements(
  merchantId: string,
  desired: CryptoSettlementInput[],
): Promise<void> {
  const current = await getCryptoSettlements(merchantId);
  const currentByAsset = new Map(current.map((s) => [s.asset, s]));
  const desiredByAsset = new Map(desired.map((s) => [s.asset, s]));

  const toAdd: CryptoSettlementInput[] = [];
  for (const [asset, want] of desiredByAsset) {
    const existing = currentByAsset.get(asset);
    if (!existing) {
      toAdd.push(want);
    } else if (existing.destination !== want.destination) {
      await updateCryptoSettlement(merchantId, existing.id, want.destination);
    }
  }
  await addCryptoSettlements(merchantId, toAdd);

  for (const [asset, existing] of currentByAsset) {
    if (!desiredByAsset.has(asset)) {
      await deleteCryptoSettlement(merchantId, existing.id);
    }
  }
}

interface ProvisionMerchantParams {
  name: string;
  email: string;
  addresses: Partial<Record<NetworkId, string>>;
  /** Selected token ids (`<namespace>:<SYMBOL>`). Only matching tokens settle. */
  tokens?: string[];
}

/**
 * First-time provisioning at onboarding finish: create the merchant, then
 * register its crypto settlements. Returns the server merchant id.
 */
export async function provisionMerchant(
  params: ProvisionMerchantParams,
): Promise<{ merchantId: string }> {
  const { id } = await createMerchant({
    name: params.name,
    email: params.email,
  });
  await syncCryptoSettlements(
    id,
    buildCryptoSettlements(params.addresses, params.tokens),
  );
  return { merchantId: id };
}
