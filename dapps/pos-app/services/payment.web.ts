import { useSettingsStore } from "@/store/useSettingsStore";
import {
  ApiError,
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";

/**
 * Get merchant credentials for proxy requests
 * @returns Object with merchantId and apiKey
 * @throws Error if credentials are missing
 */
async function getMerchantCredentials(): Promise<{
  merchantId: string;
  apiKey: string;
}> {
  const merchantId = useSettingsStore.getState().merchantId;
  const apiKey = await useSettingsStore.getState().getPartnerApiKey();

  if (!merchantId || merchantId.trim().length === 0) {
    throw new Error("Merchant ID is not configured");
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Partner API key is not configured");
  }

  return { merchantId, apiKey };
}

/**
 * Start a new payment (Web version - uses Vercel serverless proxy)
 * @param request - Payment request data
 * @returns Payment response with paymentId
 */
export async function startPayment(
  request: StartPaymentRequest,
): Promise<StartPaymentResponse> {
  const { merchantId, apiKey } = await getMerchantCredentials();

  const response = await fetch("/api/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-merchant-id": merchantId,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || `HTTP error! status: ${response.status}`,
      code: data.code,
      status: response.status,
    };
    throw error;
  }

  return data as StartPaymentResponse;
}

/**
 * Get payment status by payment ID (Web version - uses Vercel serverless proxy)
 * @param paymentId - The payment ID to check status for
 * @returns Payment status response
 */
export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResponse> {
  if (!paymentId?.trim()) {
    throw new Error("paymentId is required");
  }

  const { merchantId, apiKey } = await getMerchantCredentials();

  const response = await fetch(
    `/api/payment-status?paymentId=${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "x-merchant-id": merchantId,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || `HTTP error! status: ${response.status}`,
      code: data.code,
      status: response.status,
    };
    throw error;
  }

  return data as PaymentStatusResponse;
}

/**
 * Cancel a payment by payment ID (Web version - uses Vercel serverless proxy)
 * Only works for payments in requires_action state; returns 400 otherwise.
 * @param paymentId - The payment ID to cancel
 */
export async function cancelPayment(paymentId: string): Promise<void> {
  if (!paymentId?.trim()) {
    throw new Error("paymentId is required");
  }

  const { merchantId, apiKey } = await getMerchantCredentials();

  const response = await fetch(
    `/api/cancel-payment?paymentId=${encodeURIComponent(paymentId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "x-merchant-id": merchantId,
      },
    },
  );

  if (!response.ok) {
    const data = await response.json();
    const error: ApiError = {
      message: data.message || `HTTP error! status: ${response.status}`,
      code: data.code,
      status: response.status,
    };
    throw error;
  }
}
