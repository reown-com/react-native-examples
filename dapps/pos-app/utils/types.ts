export type Namespace = "eip155" | "solana";

// Payment API Types
export type PaymentStatus = "pending" | "completed" | "failed" | "confirming";

export interface StartPaymentRequest {
  merchantId: string;
  refId: string;
  amount: number; // amount in cents i.e. $1 = 100
  currency: string;
}

export interface StartPaymentResponse {
  paymentId: string;
}

export interface PaymentStatusBaseResponse {
  status: PaymentStatus;
  paymentId: string;
  chainName: string;
  chainId: number;
  token: string;
  amount: number;
  referenceId: string;
  createdAt: number;
}

export type PaymentStatusSuccessResponse = PaymentStatusBaseResponse & {
  status: "completed";
};

export type PaymentStatusPendingResponse = PaymentStatusBaseResponse & {
  status: "pending";
};

export type PaymentStatusConfirmingResponse = PaymentStatusBaseResponse & {
  status: "confirming";
};

export interface PaymentStatusErrorResponse {
  status: "failed";
  error: string; // Error code (e.g., "INSUFFICIENT_BALANCE")
}

export type PaymentStatusResponse =
  | PaymentStatusSuccessResponse
  | PaymentStatusErrorResponse
  | PaymentStatusPendingResponse
  | PaymentStatusConfirmingResponse;

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
