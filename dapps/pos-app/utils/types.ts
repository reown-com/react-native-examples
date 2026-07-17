export type ThemeMode = "light" | "dark" | "system";

export type Namespace = "eip155" | "solana";

// Payment API Types
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

// Transaction/Activity Types
export type TransactionStatus = PaymentStatus;

export type TransactionFilterType =
  | "all"
  | "pending"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

export type DateRangeFilterType =
  | "all_time"
  | "today"
  | "7_days"
  | "this_week"
  | "this_month";

export interface DisplayAmount {
  formatted?: string;
  assetSymbol?: string;
  decimals?: number;
  iconUrl?: string;
  networkName?: string;
}

export interface AmountWithDisplay {
  unit?: string;
  value?: string;
  display?: DisplayAmount;
}

export interface BuyerInfo {
  accountCaip10?: string;
  accountProviderName?: string;
  accountProviderIcon?: string;
}

export interface TransactionInfo {
  networkId?: string;
  hash?: string;
  nonce?: number;
}

export interface SettlementInfo {
  status?: string;
  txHash?: string;
}

export interface PaymentRecord {
  paymentId: string;
  merchantId?: string;
  referenceId?: string;
  status: TransactionStatus;
  isTerminal: boolean;
  fiatAmount?: AmountWithDisplay;
  tokenAmount?: AmountWithDisplay;
  buyer?: BuyerInfo;
  transaction?: TransactionInfo;
  settlement?: SettlementInfo;
  createdAt?: string;
  lastUpdatedAt?: string;
  settledAt?: string;
}

export interface TotalRevenue {
  amount: number;
  currency: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalCustomers: number;
  totalRevenue?: TotalRevenue[];
}

export interface TransactionsResponse {
  data: PaymentRecord[];
  stats?: TransactionStats;
  nextCursor?: string | null;
}
