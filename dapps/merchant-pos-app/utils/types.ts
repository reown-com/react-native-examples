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

// ── Local merchant identity (wallet = merchant) ─────────────────────
export interface MerchantConfig {
  /** Connected wallet address for the active namespace — the merchant identity key. */
  address: string;
  namespace: NetworkId;
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
  label?: string;
  amountCents: number;
  currency: string;
  gatewayUrl: string;
  createdAt: number;
  /** Epoch ms; links display a 10-day validity window. */
  expiresAt: number;
}
