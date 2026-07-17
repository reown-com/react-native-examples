import { useSettingsStore } from "@/store/useSettingsStore";
import { TransactionsResponse } from "@/utils/types";

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
 * Fetch merchant transactions via server-side proxy (web version)
 * @param options - Optional query parameters for filtering and pagination
 * @returns TransactionsResponse with list of payments and stats
 */
export async function getTransactions(
  options: GetTransactionsOptions = {},
): Promise<TransactionsResponse> {
  const merchantId = useSettingsStore.getState().merchantId;
  const apiKey = await useSettingsStore.getState().getCustomerApiKey();

  if (!merchantId || merchantId.trim().length === 0) {
    throw new Error("Merchant ID is not configured");
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Customer API key is not configured");
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
  const url = `/api/transactions${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-merchant-id": merchantId,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch transactions: ${response.status}`,
    );
  }

  return response.json();
}
