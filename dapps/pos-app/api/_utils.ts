import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const MERCHANT_API_BASE_URL =
  process.env.EXPO_PUBLIC_MERCHANT_DEV_API_URL || API_BASE_URL;

/**
 * Extract and validate merchant credentials from a proxied request.
 * Returns the credentials or sends an error response and returns null.
 */
export function extractCredentials(
  req: VercelRequest,
  res: VercelResponse,
): { apiKey: string; merchantId: string } | null {
  const apiKey = req.headers["x-api-key"] as string;
  const merchantId = req.headers["x-merchant-id"] as string;

  if (!apiKey || !merchantId) {
    res.status(400).json({
      message: "Missing required headers: x-api-key and x-merchant-id",
    });
    return null;
  }

  return { apiKey, merchantId };
}

/**
 * Get the validated API base URL, or send a 500 error and return null.
 */
export function getApiBaseUrl(res: VercelResponse): string | null {
  if (!API_BASE_URL) {
    res.status(500).json({
      message: "API_BASE_URL is not configured",
    });
    return null;
  }
  return API_BASE_URL;
}

/**
 * Get the merchant API base URL (uses dev override when set, otherwise falls back to default).
 */
export function getMerchantApiBaseUrl(res: VercelResponse): string | null {
  if (!MERCHANT_API_BASE_URL) {
    res.status(500).json({
      message: "API_BASE_URL is not configured",
    });
    return null;
  }
  return MERCHANT_API_BASE_URL;
}

/**
 * Build the headers for forwarding a request to the merchant API.
 */
export function getApiHeaders(apiKey: string, merchantId: string) {
  return {
    "Content-Type": "application/json",
    "Api-Key": apiKey,
    "Merchant-Id": merchantId,
    "WCP-Version": "2026-02-19.preview",
    "Sdk-Name": "pos-device",
    "Sdk-Version": "1.0.0",
    "Sdk-Platform": "web",
  };
}
