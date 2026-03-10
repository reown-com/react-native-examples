import { useSettingsStore } from "@/store/useSettingsStore";
import { TransactionsResponse } from "@/utils/types";
// TODO: Once Merchants API unifies auth with Payment API, switch to getApiHeaders()
import { apiClient } from "./client";

const MERCHANT_PORTAL_API_KEY = process.env.EXPO_PUBLIC_MERCHANT_PORTAL_API_KEY;

export interface GetTransactionsOptions {
  status?: string | string[];
  sortBy?: "date" | "amount";
  sortDir?: "asc" | "desc";
  limit?: number;
  cursor?: string;
  startTs?: string;
  endTs?: string;
}

/**
 * Fetch merchant transactions from the API (native version)
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

  if (options.startTs) {
    params.append("startTs", options.startTs);
  }

  if (options.endTs) {
    params.append("endTs", options.endTs);
  }

  const queryString = params.toString();
  const endpoint = `/merchants/${merchantId}/payments${queryString ? `?${queryString}` : ""}`;

  return apiClient.get<TransactionsResponse>(endpoint, {
    headers: {
      "x-api-key": MERCHANT_PORTAL_API_KEY,
    },
  });
}
