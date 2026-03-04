import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  extractCredentials,
  getApiBaseUrl,
  getApiHeaders,
} from "./_utils";

/**
 * Vercel Serverless Function to proxy payment cancellation requests
 * This avoids CORS issues by making the request server-side
 *
 * POST /api/cancel-payment?paymentId=xxx
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
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
      `${apiBaseUrl}/merchant/payment/${encodeURIComponent(paymentId)}/cancel`,
      {
        method: "POST",
        headers: getApiHeaders(
          credentials.apiKey,
          credentials.merchantId,
        ),
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cancel payment proxy error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
