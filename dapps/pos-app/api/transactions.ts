import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  extractCredentials,
  getMerchantApiBaseUrl,
  getApiHeaders,
} from "./_utils";

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
    const credentials = extractCredentials(req, res);
    if (!credentials) return;

    const apiBaseUrl = getMerchantApiBaseUrl(res);
    if (!apiBaseUrl) return;

    // Forward query params as-is (already camelCase from client)
    const params = new URLSearchParams();
    const { status, sortBy, sortDir, limit, cursor, startTs, endTs } =
      req.query;

    // Handle status (can be array for multiple status filters)
    if (status) {
      if (Array.isArray(status)) {
        status.forEach((s) => params.append("status", s));
      } else {
        params.append("status", status);
      }
    }
    if (sortBy && typeof sortBy === "string") {
      params.append("sortBy", sortBy);
    }
    if (sortDir && typeof sortDir === "string") {
      params.append("sortDir", sortDir);
    }
    if (limit && typeof limit === "string") {
      params.append("limit", limit);
    }
    if (cursor && typeof cursor === "string") {
      params.append("cursor", cursor);
    }
    if (startTs && typeof startTs === "string") {
      params.append("startTs", startTs);
    }
    if (endTs && typeof endTs === "string") {
      params.append("endTs", endTs);
    }

    const queryString = params.toString();
    const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");
    const endpoint = `/merchants/payments${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(`${normalizedBaseUrl}${endpoint}`, {
      method: "GET",
      headers: getApiHeaders(credentials.apiKey, credentials.merchantId),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

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
