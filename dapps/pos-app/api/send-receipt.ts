import type { VercelRequest, VercelResponse } from "@vercel/node";
import { extractCredentials, getApiBaseUrl, getApiHeaders } from "./_utils";

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

    // Gateways can answer with an HTML error page; keep the upstream status
    // instead of failing the parse and reporting a 500.
    const text = await response.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: `Upstream error (${response.status})` };
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Send receipt proxy error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
