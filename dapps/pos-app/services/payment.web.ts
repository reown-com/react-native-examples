import { useSettingsStore } from "@/store/useSettingsStore";
import { requestBridge } from "@/services/pos-bridge";
import { isTestPaymentId, simulateTestReceipt } from "@/services/test-payment";
import { isRunningInIframe } from "@/utils/is-running-in-iframe";
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
  const apiKey = await useSettingsStore.getState().getCustomerApiKey();

  if (!merchantId || merchantId.trim().length === 0) {
    throw new Error("Merchant ID is not configured");
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Customer API key is not configured");
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
  // Iframes never use local credentials.
  if (isRunningInIframe()) {
    return requestBridge<StartPaymentResponse>({
      operation: "start-payment",
      payload: request,
    });
  }

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

  if (isRunningInIframe()) {
    return requestBridge<PaymentStatusResponse>({
      operation: "get-payment-status",
      payload: { paymentId },
    });
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

  if (isRunningInIframe()) {
    await requestBridge<void>({
      operation: "cancel-payment",
      payload: { paymentId },
    });
    return;
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
    // Gateways can answer with an HTML error page; keep the HTTP status.
    const data = await response.json().catch(() => ({}));
    const error: ApiError = {
      message: data.message || `HTTP error! status: ${response.status}`,
      code: data.code,
      status: response.status,
    };
    throw error;
  }
}

const SEND_RECEIPT_TIMEOUT_MS = 30000;

/**
 * Email the customer a receipt (Web version - uses Vercel serverless proxy)
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

  // Not offered in the dashboard iframe, which never has local credentials.
  if (isRunningInIframe()) {
    throw new Error("Email receipts aren't available in the dashboard");
  }

  const { merchantId, apiKey } = await getMerchantCredentials();

  // Match the native client's timeout so a hung request can't leave the
  // email screen stuck on "Sending receipt…".
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    SEND_RECEIPT_TIMEOUT_MS,
  );
  let response: Response;
  try {
    response = await fetch(
      `/api/send-receipt?paymentId=${encodeURIComponent(paymentId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-merchant-id": merchantId,
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError: ApiError = {
        message: `Request timeout after ${SEND_RECEIPT_TIMEOUT_MS}ms`,
        code: "TIMEOUT",
      };
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error: ApiError = {
      message: data.message || `HTTP error! status: ${response.status}`,
      code: data.code,
      status: response.status,
    };
    throw error;
  }
}
