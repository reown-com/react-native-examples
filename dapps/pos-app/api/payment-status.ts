import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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

    // Extract merchant credentials from request headers
    const apiKey = req.headers["x-api-key"] as string;
    const merchantId = req.headers["x-merchant-id"] as string;

    if (!apiKey || !merchantId) {
      return res.status(400).json({
        message: "Missing required headers: x-api-key and x-merchant-id",
      });
    }

    if (!API_BASE_URL) {
      return res.status(500).json({
        message: "API_BASE_URL is not configured",
      });
    }

    // Forward the request to the merchant API
    const response = await fetch(
      `${API_BASE_URL}/merchant/payment/${encodeURIComponent(paymentId)}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": apiKey,
          "Merchant-Id": merchantId,
          "Sdk-Name": "pos-device",
          "Sdk-Version": "1.0.0",
          "Sdk-Platform": "web",
        },
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

