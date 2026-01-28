import { useLogsStore } from "@/store/useLogsStore";
import { ApiError } from "@/utils/types";

const MERCHANT_API_BASE_URL = process.env.EXPO_PUBLIC_MERCHANT_API_URL;
const MERCHANT_PORTAL_API_KEY =
  process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_PORTAL_API_KEY;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
}

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

class MerchantApiClient {
  private baseUrl: string | undefined;
  private apiKey: string | undefined;

  constructor(baseUrl: string | undefined, apiKey: string | undefined) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.baseUrl && !!this.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    if (!this.baseUrl) {
      const error: ApiError = {
        message: "Merchant API URL is not configured",
        code: "CONFIG_ERROR",
      };
      throw error;
    }

    if (!this.apiKey) {
      const error: ApiError = {
        message: "Merchant Portal API key is not configured",
        code: "CONFIG_ERROR",
      };
      throw error;
    }

    const { body, headers, timeout, ...fetchOptions } = options;

    // Normalize URL construction: remove trailing slash from baseUrl and ensure endpoint starts with /
    const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${normalizedBaseUrl}${normalizedEndpoint}`;

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...headers,
    };

    // Set up timeout with AbortController
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
        throw error;
      }

      const data = await response.json();
      useLogsStore
        .getState()
        .addLog(
          "info",
          "Merchant API request successful",
          "merchant-api",
          "request",
          {
            endpoint,
          },
        );
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout/abort errors
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = {
          message: `Request timeout after ${timeoutMs}ms`,
          code: "TIMEOUT",
        };
        useLogsStore
          .getState()
          .addLog("error", timeoutError.message, "merchant-api", "request", {
            endpoint,
          });
        throw timeoutError;
      }

      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as ApiError;
        useLogsStore
          .getState()
          .addLog(
            "error",
            apiError.message || "Merchant API request failed",
            "merchant-api",
            "request",
            { endpoint, response: error },
          );
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      useLogsStore
        .getState()
        .addLog("error", errorMessage, "merchant-api", "request", { endpoint });
      const apiError: ApiError = {
        message: errorMessage,
      };
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
}

export const merchantApiClient = new MerchantApiClient(
  MERCHANT_API_BASE_URL,
  MERCHANT_PORTAL_API_KEY,
);
