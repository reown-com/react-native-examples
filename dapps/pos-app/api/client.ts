import { useLogsStore } from "@/store/useLogsStore";
import { ApiError } from "@/utils/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL environment variable is not configured");
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body, headers, ...fetchOptions } = options;

    // Normalize URL construction: remove trailing slash from baseUrl and ensure endpoint starts with /
    const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${normalizedBaseUrl}${normalizedEndpoint}`;

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    const config: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

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
        .addLog("info", "API request successful", "api", "request", {
          endpoint,
          data,
        });
      return data as T;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as ApiError;
        useLogsStore
          .getState()
          .addLog(
            "error",
            apiError.message || "API request failed",
            "api",
            "request",
            { status: apiError.status, code: apiError.code, endpoint },
          );
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      useLogsStore
        .getState()
        .addLog("error", errorMessage, "api", "request", { endpoint });
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
