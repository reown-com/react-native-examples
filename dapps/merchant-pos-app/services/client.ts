import { useMerchantStore } from "@/store/useMerchantStore";
import { MerchantConfig } from "@/utils/merchant-config";
import { ApiError } from "@/utils/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
}

const DEFAULT_TIMEOUT_MS = 30000;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error(
        "EXPO_PUBLIC_API_URL is not configured — set it in .env to use the payment API.",
      );
    }

    const { body, headers, timeout, ...fetchOptions } = options;

    const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${normalizedBaseUrl}${normalizedEndpoint}`;

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    const controller = new AbortController();
    const timeoutMs = timeout ?? DEFAULT_TIMEOUT_MS;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    if (__DEV__) {
      console.log(`[WCPay] → ${fetchOptions.method ?? "GET"} ${url}`);
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        const error: ApiError = {
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          code: errorData.code,
          status: response.status,
        };
        if (__DEV__) {
          console.warn(
            `[WCPay] ✗ ${response.status} ${fetchOptions.method ?? "GET"} ${url} — ${error.message}`,
          );
        }
        throw error;
      }

      if (__DEV__) {
        console.log(`[WCPay] ✓ ${response.status} ${url}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = {
          message: `Request timeout after ${timeoutMs}ms`,
          code: "TIMEOUT",
        };
        if (__DEV__) console.warn(`[WCPay] ✗ timeout ${url}`);
        throw timeoutError;
      }

      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      if (__DEV__) {
        console.warn(`[WCPay] ✗ network error ${url} — ${errorMessage}`);
      }
      const apiError: ApiError = { message: errorMessage };
      throw apiError;
    }
  }

  private async parseErrorResponse(
    response: Response,
  ): Promise<{ message?: string; code?: string }> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }
}

export const apiClient = new ApiClient(API_BASE_URL ?? "");

/**
 * Auth headers for WCPay requests. Merchant-Id is the id of the currently
 * active merchant (created via the pay-core upsert at onboarding finish); the
 * Api-Key is the partner-scoped customer key from env.
 */
export function getApiHeaders(): Record<string, string> {
  const customerApiKey = MerchantConfig.getCustomerApiKey();
  const active = useMerchantStore.getState().getActiveMerchant();
  const merchantId = active?.merchantId;

  if (!merchantId || merchantId.trim().length === 0) {
    throw new Error(
      "No active merchant — finish onboarding to create one before charging.",
    );
  }
  if (!customerApiKey || customerApiKey.trim().length === 0) {
    throw new Error(
      "API key is not configured — set EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY in .env.",
    );
  }

  return {
    "Api-Key": customerApiKey,
    "Merchant-Id": merchantId,
    "WCP-Version": "2026-02-19.preview",
    "Sdk-Name": "pos-device",
    "Sdk-Version": "1.0.0",
    "Sdk-Platform": "react-native",
  };
}
