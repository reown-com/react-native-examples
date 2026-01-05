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
