import {
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";
import * as Sentry from "@sentry/react-native";
import { apiClient, getApiHeaders } from "./client";
import { isTestPaymentId, simulateTestReceipt } from "./test-payment";

/**
 * Start a new payment
 * @param request - Payment request data
 * @returns Payment response with paymentId
 */
export async function startPayment(
  request: StartPaymentRequest,
): Promise<StartPaymentResponse> {
  return Sentry.startSpan(
    { name: "payment.create", op: "payment.create" },
    async () => {
      const headers = await getApiHeaders();
      return apiClient.post<StartPaymentResponse>(
        "/merchant/payment",
        request,
        { headers },
      );
    },
  );
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
  await Sentry.startSpan(
    { name: "payment.cancel", op: "payment.cancel" },
    async () => {
      const headers = await getApiHeaders();
      await apiClient.post(`/payments/${paymentId}/cancel`, {}, { headers });
    },
  );
}

/**
 * Email the customer a receipt for a completed payment
 * @param paymentId - The payment ID to send the receipt for
 * @param email - Customer email address
 */
export async function sendReceipt(
  paymentId: string,
  email: string,
): Promise<void> {
  if (!paymentId?.trim()) {
    throw new Error("paymentId is required");
  }
  if (isTestPaymentId(paymentId)) {
    return simulateTestReceipt();
  }
  await Sentry.startSpan(
    { name: "payment.receipt", op: "payment.receipt" },
    async () => {
      const headers = await getApiHeaders();
      await apiClient.post(
        `/merchants/payments/${encodeURIComponent(paymentId)}/receipt`,
        { email },
        { headers, redactLogBodies: true },
      );
    },
  );
}
