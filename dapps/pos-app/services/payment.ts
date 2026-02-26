import { useSettingsStore } from "@/store/useSettingsStore";
import {
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";
import { apiClient } from "./client";

/**
 * Get API headers for authenticated requests
 * @returns Headers object with Api-Key, Merchant-Id, and SDK headers
 * @throws Error if customer API key or merchant ID is missing
 */
async function getApiHeaders(): Promise<Record<string, string>> {
  const merchantId = useSettingsStore.getState().merchantId;
  const customerApiKey = await useSettingsStore.getState().getCustomerApiKey();

  if (!merchantId || merchantId.trim().length === 0) {
    throw new Error("Merchant ID is not configured");
  }

  if (!customerApiKey || customerApiKey.trim().length === 0) {
    throw new Error("Customer API key is not configured");
  }

  return {
    "Api-Key": customerApiKey,
    "Merchant-Id": merchantId,
    "Sdk-Name": "pos-device",
    "Sdk-Version": "1.0.0",
    "Sdk-Platform": "react-native",
  };
}

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
