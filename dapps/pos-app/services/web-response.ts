import { ApiError } from "@/utils/types";

/**
 * Read a response from one of our `/api/*` proxies. Throws an ApiError that
 * keeps the HTTP status on failure, and on a body that isn't JSON (e.g. a
 * gateway HTML page) instead of a bare SyntaxError. Empty bodies resolve to
 * undefined.
 */
export async function readProxyResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: { message?: string; code?: string } | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    const error: ApiError = response.ok
      ? {
          message: `Invalid JSON response (status ${response.status})`,
          code: "INVALID_RESPONSE",
          status: response.status,
        }
      : {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        };
    throw error;
  }

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message || `HTTP error! status: ${response.status}`,
      code: data?.code,
      status: response.status,
    };
    throw error;
  }

  return data as T;
}
