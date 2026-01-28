import type { VercelRequest, VercelResponse } from "@vercel/node";

const MERCHANT_API_BASE_URL = process.env.EXPO_PUBLIC_MERCHANT_API_URL;
const MERCHANT_PORTAL_API_KEY = process.env.EXPO_PUBLIC_MERCHANT_PORTAL_API_KEY;

/**
 * Vercel Serverless Function to proxy transaction list requests
 * This avoids CORS issues by making the request server-side
 *
 * GET /api/transactions?status=...&limit=...&cursor=...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Extract merchant ID from request headers
    const merchantId = req.headers["x-merchant-id"] as string;

    if (!merchantId) {
      return res.status(400).json({
        message: "Missing required header: x-merchant-id",
      });
    }

    if (!MERCHANT_API_BASE_URL) {
      return res.status(500).json({
        message: "MERCHANT_API_BASE_URL is not configured",
      });
    }

    if (!MERCHANT_PORTAL_API_KEY) {
      return res.status(500).json({
        message: "MERCHANT_PORTAL_API_KEY is not configured",
      });
    }

    // Build query string from request query params
    const params = new URLSearchParams();
    const { status, sort_by, sort_dir, limit, cursor } = req.query;

    // Handle status (can be array for multiple status filters)
    if (status) {
      if (Array.isArray(status)) {
        status.forEach((s) => params.append("status", s));
      } else {
        params.append("status", status);
      }
    }
    if (sort_by && typeof sort_by === "string") {
      params.append("sort_by", sort_by);
    }
    if (sort_dir && typeof sort_dir === "string") {
      params.append("sort_dir", sort_dir);
    }
    if (limit && typeof limit === "string") {
      params.append("limit", limit);
    }
    if (cursor && typeof cursor === "string") {
      params.append("cursor", cursor);
    }

    const queryString = params.toString();
    const normalizedBaseUrl = MERCHANT_API_BASE_URL.replace(/\/+$/, "");
    const endpoint = `/merchants/${encodeURIComponent(merchantId)}/payments${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(`${normalizedBaseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MERCHANT_PORTAL_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Transactions proxy error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
