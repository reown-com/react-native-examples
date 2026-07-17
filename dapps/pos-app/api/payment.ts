import type { VercelRequest, VercelResponse } from "@vercel/node";
import { extractCredentials, getApiBaseUrl, getApiHeaders } from "./_utils";

/**
 * Vercel Serverless Function to proxy payment creation requests
 * This avoids CORS issues by making the request server-side
 *
 * POST /api/payment
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const credentials = extractCredentials(req, res);
    if (!credentials) return;

    const apiBaseUrl = getApiBaseUrl(res);
    if (!apiBaseUrl) return;

    // Forward the request to the merchant API
    const response = await fetch(`${apiBaseUrl}/merchant/payment`, {
      method: "POST",
      headers: getApiHeaders(credentials.apiKey, credentials.merchantId),
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Payment proxy error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
