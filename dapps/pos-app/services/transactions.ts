import { TransactionsResponse } from "@/utils/types";
import { merchantApiClient, getApiHeaders } from "./client";

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
  const headers = await getApiHeaders();

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
    params.append("sortBy", options.sortBy);
  }

  if (options.sortDir) {
    params.append("sortDir", options.sortDir);
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
  const endpoint = `/merchants/payments${queryString ? `?${queryString}` : ""}`;

  return merchantApiClient.get<TransactionsResponse>(endpoint, {
    headers,
  });
}
