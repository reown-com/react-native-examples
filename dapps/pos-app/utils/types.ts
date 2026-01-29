export type Namespace = "eip155" | "solana";

// Payment API Types
export type PaymentStatus =
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed"
  | "expired";

export interface StartPaymentRequest {
  referenceId: string;
  amount: {
    value: string;
    unit: string;
  };
}

export interface StartPaymentResponse {
  paymentId: string;
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

export type TransactionFilterType = "all" | "failed" | "pending" | "completed";

export interface PaymentRecord {
  payment_id: string;
  reference_id: string;
  status: TransactionStatus;
  merchant_id: string;
  is_terminal: boolean;
  wallet_name: string;
  version: string;
  tx_hash?: string;
  fiat_amount?: number;
  fiat_currency?: string;
  token_amount?: string;
  token_caip19?: string;
  chain_id?: string;
  created_at?: string;
  confirmed_at?: string;
  broadcasted_at?: string;
  processing_at?: string;
  finalized_at?: string;
  last_updated_at?: string;
  buyer_caip10?: string;
  nonce?: number;
}

export interface TransactionStats {
  total_transactions: number;
  total_customers: number;
  total_revenue?: {
    amount: number;
    currency: string;
  };
}

export interface TransactionsResponse {
  data: PaymentRecord[];
  stats?: TransactionStats;
  next_cursor?: string | null;
}
