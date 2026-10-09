import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { maskPathIds } from "@/utils/api";
import { ApiError } from "@/utils/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL environment variable is not configured");
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
  /**
   * Keep the request and response bodies out of the persisted logs, for
   * requests that carry personal data (e.g. a customer's email).
   */
  redactLogBodies?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body, headers, timeout, redactLogBodies, ...fetchOptions } =
      options;
    const loggedBody = redactLogBodies ? "[redacted]" : body;
    const logResponse = (response: unknown) =>
      redactLogBodies ? "[redacted]" : response;

    // Normalize URL construction: remove trailing slash from baseUrl and ensure endpoint starts with /
    const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${normalizedBaseUrl}${normalizedEndpoint}`;
    const method = fetchOptions.method ?? "GET";

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
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

      const data = await this.parseSuccessResponse(response);
      useLogsStore
        .getState()
        .addLog(
          "info",
          `${method} ${maskPathIds(normalizedEndpoint)}`,
          "api",
          "request",
          {
            method,
            endpoint,
            body: loggedBody,
            response: logResponse(data),
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
          .addLog("error", timeoutError.message, "api", "request", {
            method,
            endpoint,
            body: loggedBody,
          });
        throw timeoutError;
      }

      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as ApiError;
        useLogsStore.getState().addLog(
          "error",
          // Server messages can echo the request (e.g. an invalid email).
          redactLogBodies
            ? `API request failed (${apiError.status})`
            : apiError.message || "API request failed",
          "api",
          "request",
          {
            method,
            endpoint,
            body: loggedBody,
            response: logResponse(error),
          },
        );
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      useLogsStore
        .getState()
        .addLog("error", errorMessage, "api", "request", { method, endpoint });
      const apiError: ApiError = {
        message: errorMessage,
      };
      throw apiError;
    }
  }

  // Some endpoints answer 204 or an empty 200; treat both as no body rather
  // than failing a request that already succeeded.
  private async parseSuccessResponse(response: Response): Promise<unknown> {
    if (response.status === 204) return undefined;
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
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

export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Get API headers for authenticated requests
 * @returns Headers object with Api-Key, Merchant-Id, and SDK headers
 * @throws Error if customer API key or merchant ID is missing
 */
export async function getApiHeaders(): Promise<Record<string, string>> {
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
    "WCP-Version": "2026-02-19.preview",
    "Sdk-Name": "pos-device",
    "Sdk-Version": "1.0.0",
    "Sdk-Platform": "react-native",
  };
}
