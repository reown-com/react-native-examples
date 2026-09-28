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
      if (config.body) console.log(`[WCPay]   body ${config.body}`);
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
          // Surface the full body — validation errors carry field-level detail
          // that the top-level message/code alone hides.
          if (errorData.raw) console.warn(`[WCPay]   ↳ ${errorData.raw}`);
        }
        throw error;
      }

      if (__DEV__) {
        console.log(`[WCPay] ✓ ${response.status} ${url}`);
      }
      // 204 No Content (e.g. DELETE) or an empty body — nothing to parse.
      if (response.status === 204) return undefined as T;
      const text = await response.text();
      return (text ? JSON.parse(text) : undefined) as T;
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
  ): Promise<{ message?: string; code?: string; raw?: string }> {
    const raw = await response.text().catch(() => "");
    try {
      const json = JSON.parse(raw) as { message?: string; code?: string };
      return { ...json, raw };
    } catch {
      return { message: raw || response.statusText, raw };
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

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL ?? "");

/** Common SDK/version headers sent on every WCPay request. */
const SDK_HEADERS: Record<string, string> = {
  "WCP-Version": "2026-02-19.preview",
  "Sdk-Name": "pos-device",
  "Sdk-Version": "1.0.0",
  "Sdk-Platform": "react-native",
};

/** Resolve the partner-scoped customer API key, throwing if unset. */
function requireCustomerApiKey(): string {
  const customerApiKey = MerchantConfig.getCustomerApiKey();
  if (!customerApiKey || customerApiKey.trim().length === 0) {
    throw new Error(
      "API key is not configured — set EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY in .env.",
    );
  }
  return customerApiKey;
}

/**
 * Auth headers for WCPay payment requests. Merchant-Id is the id of the
 * currently active merchant (created via POST /v1/merchants at onboarding
 * finish); the Api-Key is the partner-scoped customer key from env.
 */
export function getApiHeaders(): Record<string, string> {
  const customerApiKey = requireCustomerApiKey();
  const active = useMerchantStore.getState().getActiveMerchant();
  const merchantId = active?.merchantId;

  if (!merchantId || merchantId.trim().length === 0) {
    throw new Error(
      "No active merchant — finish onboarding to create one before charging.",
    );
  }

  return {
    "Api-Key": customerApiKey,
    "Merchant-Id": merchantId,
    ...SDK_HEADERS,
  };
}

/**
 * Auth headers for merchant-management + settlement requests. Unlike
 * `getApiHeaders`, this does NOT require an active Merchant-Id: at create time
 * no merchant exists yet, and for settlement calls the merchant id lives in the
 * URL path. Pass an `idempotencyKey` on mutating calls (POST/PUT).
 */
export function getMerchantManagementHeaders(
  idempotencyKey?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Api-Key": requireCustomerApiKey(),
    ...SDK_HEADERS,
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  return headers;
}
