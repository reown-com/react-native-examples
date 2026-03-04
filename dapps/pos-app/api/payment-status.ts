import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  extractCredentials,
  getApiBaseUrl,
  getApiHeaders,
} from "./_utils";

/**
 * Vercel Serverless Function to proxy payment status requests
 * This avoids CORS issues by making the request server-side
 *
 * GET /api/payment-status?paymentId=xxx
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Extract payment ID from query params
    const { paymentId } = req.query;

    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({
        message: "Missing required query parameter: paymentId",
      });
    }

    const credentials = extractCredentials(req, res);
    if (!credentials) return;

    const apiBaseUrl = getApiBaseUrl(res);
    if (!apiBaseUrl) return;

    // Forward the request to the merchant API
    const response = await fetch(
      `${apiBaseUrl}/merchant/payment/${encodeURIComponent(paymentId)}/status`,
      {
        method: "GET",
        headers: getApiHeaders(
          credentials.apiKey,
          credentials.merchantId,
        ),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Payment status proxy error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
