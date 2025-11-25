import {
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";
import { apiClient } from "./client";

/**
 * Start a new payment
 * @param request - Payment request data
 * @returns Payment response with paymentId
 */
export async function startPayment(
  request: StartPaymentRequest,
): Promise<StartPaymentResponse> {
  return apiClient.post<StartPaymentResponse>("/start", request);
}

/**
 * Get payment status by payment ID
 * @param paymentId - The payment ID to check status for
 * @returns Payment status response
 */
export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResponse> {
  return apiClient.get<PaymentStatusResponse>(`/status/${paymentId}`);
}
