import { useSettingsStore } from "@/store/useSettingsStore";
import { TransactionsResponse } from "@/utils/types";
import { merchantApiClient } from "./merchant-client";

export interface GetTransactionsOptions {
  status?: string | string[];
  sortBy?: "date" | "amount";
  sortDir?: "asc" | "desc";
  limit?: number;
  cursor?: string;
}

const MERCHANT_PORTAL_API_KEY = process.env.EXPO_PUBLIC_MERCHANT_PORTAL_API_KEY;

/**
 * Fetch merchant transactions from the Merchant Portal API (native version)
 * @param options - Optional query parameters for filtering and pagination
 * @returns TransactionsResponse with list of payments and stats
 */
export async function getTransactions(
  options: GetTransactionsOptions = {},
): Promise<TransactionsResponse> {
  const merchantId = useSettingsStore.getState().merchantId;

  if (!merchantId) {
    throw new Error("Merchant ID is not configured");
  }

  if (!MERCHANT_PORTAL_API_KEY) {
    throw new Error("Merchant Portal API key is not configured");
  }

  // Build query string from options
  const params = new URLSearchParams();

  if (options.status) {
    if (Array.isArray(options.status)) {
      options.status.forEach((s) => params.append("status", s));
    } else {
      params.append("status", options.status);
    }
  }

  if (options.sortBy) {
    params.append("sort_by", options.sortBy);
  }

  if (options.sortDir) {
    params.append("sort_dir", options.sortDir);
  }

  if (options.limit) {
    params.append("limit", options.limit.toString());
  }

  if (options.cursor) {
    params.append("cursor", options.cursor);
  }

  const queryString = params.toString();
  const endpoint = `/merchants/${merchantId}/payments${queryString ? `?${queryString}` : ""}`;

  return merchantApiClient.get<TransactionsResponse>(endpoint, {
    headers: {
      "x-api-key": MERCHANT_PORTAL_API_KEY,
    },
  });
}
