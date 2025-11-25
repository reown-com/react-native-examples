export type Namespace = "eip155" | "solana";

// Payment API Types
export type PaymentStatus = "pending" | "ok" | "error";

export interface StartPaymentRequest {
  merchantId: string;
  refId: string;
  amount: number; // amount in cents i.e. $1 = 100
  currency: string;
}

export interface StartPaymentResponse {
  paymentId: string;
}

export interface PaymentStatusSuccessResponse {
  status: "ok";
}

export interface PaymentStatusErrorResponse {
  status: "error";
  error: string; // Error code (e.g., "INSUFFICIENT_BALANCE")
}

export interface PaymentStatusPendingResponse {
  status: "pending";
  paymentId: string;
  amount: number;
  referenceId: string;
  createdAt: number;
}

export type PaymentStatusResponse =
  | PaymentStatusSuccessResponse
  | PaymentStatusErrorResponse
  | PaymentStatusPendingResponse;

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
