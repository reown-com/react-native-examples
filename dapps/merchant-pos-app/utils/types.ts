import { NetworkId } from "@/constants/networks";

export type ThemeMode = "light" | "dark" | "system";

// ── WCPay payment API ──────────────────────────────────────────────
export type PaymentStatus =
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed"
  | "expired"
  | "cancelled";

export interface StartPaymentRequest {
  referenceId: string;
  amount: {
    value: string;
    unit: string;
  };
  /**
   * Optional absolute expiry (epoch seconds). Defaults server-side to ~15 min
   * for a POS charge; payment links pass a 10-day expiry.
   */
  expiresAt?: number;
}

export interface StartPaymentResponse {
  paymentId: string;
  expiresAt: number | null;
  gatewayUrl: string;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  isFinal: boolean;
  pollInMs: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// ── Local merchant identity (one merchant per app install) ──────────
export interface MerchantConfig {
  /** Connected wallet address for the active namespace — local routing key. */
  address: string;
  namespace: NetworkId;
  /**
   * Remote merchant id (the persistent per-install id used to upsert the
   * merchant via the pay-core API). Stable across re-onboards on this install.
   */
  merchantId?: string;
  /** Last pay-core merchant `version` we synced; incremented on each upsert. */
  version?: number;
  /**
   * Settlement address per namespace. A wallet can expose a different address
   * for EVM vs Solana, so each connected namespace is tracked separately.
   */
  addresses?: Partial<Record<NetworkId, string>>;
  email: string;
  companyName: string;
  logoUri?: string;
  /** Settlement networks chosen during onboarding. */
  networks: NetworkId[];
  /** Token ids (see constants/networks TOKENS) the merchant accepts. */
  tokens: string[];
  /** Epoch ms when ownership was verified by signing. */
  verifiedAt: number;
}

// ── Locally tracked records ─────────────────────────────────────────
export interface PaymentRecord {
  id: string;
  /** Active merchant (wallet) this record belongs to — scopes activity per merchant. */
  merchantAddress: string;
  paymentId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  createdAt: number;
}

export interface PaymentLink {
  id: string;
  /** Active merchant (wallet) this link belongs to — scopes links per merchant. */
  merchantAddress: string;
  /** WCPay payment id backing this link — polled to detect payment. */
  paymentId?: string;
  label?: string;
  amountCents: number;
  currency: string;
  gatewayUrl: string;
  createdAt: number;
  /** Epoch ms; links display a 10-day validity window. */
  expiresAt: number;
  /** Last polled payment status (undefined until first reconcile). */
  status?: PaymentStatus;
  /**
   * True once this link's payment has reached a final state and been folded
   * into the payments store — stops further polling and double-counting.
   */
  recorded?: boolean;
}
