import {
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";
import { apiClient, getApiHeaders } from "./client";

/**
 * Start a new payment
 * @param request - Payment request data
 * @returns Payment response with paymentId
 */
export async function startPayment(
  request: StartPaymentRequest,
): Promise<StartPaymentResponse> {
  const headers = await getApiHeaders();
  return apiClient.post<StartPaymentResponse>("/merchant/payment", request, {
    headers,
  });
}

/**
 * Get payment status by payment ID
 * @param paymentId - The payment ID to check status for
 * @returns Payment status response
 */
export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResponse> {
  if (!paymentId?.trim()) {
    throw new Error("paymentId is required");
  }
  const headers = await getApiHeaders();
  return apiClient.get<PaymentStatusResponse>(
    `/merchant/payment/${paymentId}/status`,
    { headers },
  );
}

/**
 * Cancel a payment by payment ID
 * Only works for payments in requires_action state; returns 400 otherwise.
 * @param paymentId - The payment ID to cancel
 */
export async function cancelPayment(paymentId: string): Promise<void> {
  if (!paymentId?.trim()) {
    throw new Error("paymentId is required");
  }
  const headers = await getApiHeaders();
  await apiClient.post(`/payments/${paymentId}/cancel`, {}, { headers });
}
