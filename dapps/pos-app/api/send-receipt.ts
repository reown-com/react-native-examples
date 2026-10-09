import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  extractCredentials,
  getApiBaseUrl,
  getApiHeaders,
  readUpstreamResponse,
} from "./_utils";

/**
 * Vercel Serverless Function to proxy email receipt requests
 * This avoids CORS issues by making the request server-side
 *
 * POST /api/send-receipt?paymentId=xxx
 * Body: { email: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({
        message: "Missing required query parameter: paymentId",
      });
    }

    const email = req.body?.email;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Missing required body field: email",
      });
    }

    const credentials = extractCredentials(req, res);
    if (!credentials) return;

    const apiBaseUrl = getApiBaseUrl(res);
    if (!apiBaseUrl) return;
    const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");

    // Forward the request to the merchant API
    const response = await fetch(
      `${normalizedBaseUrl}/merchants/payments/${encodeURIComponent(paymentId)}/receipt`,
      {
        method: "POST",
        headers: getApiHeaders(credentials.apiKey, credentials.merchantId),
        body: JSON.stringify({ email }),
      },
    );

    const { ok, status, data } = await readUpstreamResponse(response);

    if (!ok) {
      return res.status(status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Send receipt proxy error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
