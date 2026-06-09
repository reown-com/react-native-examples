import { useLogsStore } from "@/store/useLogsStore";
import { getDateRange } from "@/utils/date-range";
import {
  DateRangeFilterType,
  PaymentRecord,
  PaymentStatus,
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
  TransactionFilterType,
  TransactionsResponse,
} from "@/utils/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { cancelPayment, getPaymentStatus, startPayment } from "./payment";
import { getTransactions } from "./transactions";

const KNOWN_STATUSES: string[] = [
  "requires_action",
  "processing",
  "succeeded",
  "failed",
  "expired",
  "cancelled",
];

/**
 * Normalizes a payment status response from the API.
 * Unknown statuses are mapped to "failed" with isFinal: true so the app
 * stops polling and routes through the existing failure path.
 */
export function normalizePaymentStatus(
  data: PaymentStatusResponse,
): PaymentStatusResponse {
  if (!KNOWN_STATUSES.includes(data.status as string)) {
    const addLog = useLogsStore.getState().addLog;
    addLog(
      "error",
      `Unknown payment status "${data.status}" — treating as failed`,
      "payment",
      "normalizePaymentStatus",
      { originalStatus: data.status, isFinal: data.isFinal },
    );
    return { ...data, status: "failed", isFinal: true };
  }
  return data;
}

/**
 * Hook to start a payment
 * @returns Mutation hook for starting payments
 */
export function useStartPayment() {
  return useMutation<StartPaymentResponse, Error, StartPaymentRequest>({
    mutationFn: startPayment,
  });
}

/**
 * Hook to cancel a payment
 * @returns Mutation hook for cancelling payments
 */
export function useCancelPayment() {
  return useMutation<void, Error, string>({
    mutationFn: cancelPayment,
  });
}

interface UsePaymentStatusOptions {
  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when payment reaches a final state (succeeded, failed, expired,
   * cancelled, or unknown status normalized to failed)
   */
  onTerminalState?: (data: PaymentStatusResponse) => void;
}

/**
 * Hook to get payment status with automatic polling.
 * Polls until payment reaches a final state (isFinal === true).
 * Unknown statuses from the API are normalized to "failed".
 * @param paymentId - The payment ID to check status for
 * @param options - Query options
 * @returns Query result with payment status data
 */
export function usePaymentStatus(
  paymentId: string | null | undefined,
  options: UsePaymentStatusOptions = {},
) {
  const { enabled = true, onTerminalState } = options;

  const hasCalledCallback = useRef(false);
  const callbackRef = useRef(onTerminalState);
  const previousPaymentIdRef = useRef(paymentId);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onTerminalState;
  }, [onTerminalState]);

  // Reset callback flag when paymentId changes
  useEffect(() => {
    if (previousPaymentIdRef.current !== paymentId) {
      hasCalledCallback.current = false;
      previousPaymentIdRef.current = paymentId;
    }
  }, [paymentId]);

  const query = useQuery<PaymentStatusResponse, Error>({
    queryKey: ["paymentStatus", paymentId],
    queryFn: async () => {
      if (!paymentId) throw new Error("Payment ID required");
      const data = await getPaymentStatus(paymentId);
      return normalizePaymentStatus(data);
    },
    enabled: enabled && !!paymentId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.isFinal) {
        return false;
      }
      const pollInMs = data?.pollInMs;
      if (
        typeof pollInMs !== "number" ||
        !Number.isFinite(pollInMs) ||
        pollInMs <= 0
      ) {
        return 2000;
      }
      return pollInMs;
    },

    // Let failed requests retry naturally
    retry: 3,
  });

  // Handle terminal state callback
  useEffect(() => {
    const data = query.data;
    if (data?.isFinal && !hasCalledCallback.current && callbackRef.current) {
      hasCalledCallback.current = true;
      callbackRef.current(data);
    }
  }, [query.data]);

  return query;
}

interface UseTransactionsOptions {
  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Filter transactions by UI filter type
   * @default "all"
   */
  filter?: TransactionFilterType;
  /**
   * Filter transactions by date range
   * @default "today"
   */
  dateRangeFilter?: DateRangeFilterType;
  /**
   * Additional query options for the API
   */
}

/**
 * Maps UI filter type to API status values
 */
function filterToStatusArray(
  filter: TransactionFilterType,
): string[] | undefined {
  switch (filter) {
    case "pending":
      return ["requires_action", "processing"];
    case "completed":
      return ["succeeded"];
    case "failed":
      return ["failed"];
    case "expired":
      return ["expired"];
    case "cancelled":
      return ["cancelled"];
    case "all":
    default:
      return undefined;
  }
}

/**
 * Hook to fetch merchant transactions with filtering and infinite scrolling
 * @param options - Query options including filter type
 * @returns Infinite query result with paginated transactions
 */
export function useTransactions(options: UseTransactionsOptions = {}) {
  const { enabled = true, filter = "all", dateRangeFilter = "today" } = options;

  const addLog = useLogsStore.getState().addLog;

  // Compute date range once per filter change so toDate stays stable across paginated fetches
  const { startTs, endTs } = useMemo(
    () => getDateRange(dateRangeFilter),
    [dateRangeFilter],
  );

  const query = useInfiniteQuery<TransactionsResponse, Error>({
    queryKey: ["transactions", filter, dateRangeFilter],
    queryFn: ({ pageParam }) => {
      const statusFilter = filterToStatusArray(filter);
      return getTransactions({
        status: statusFilter,
        startTs,
        endTs,
        sortBy: "date",
        sortDir: "desc",
        limit: 20,
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
  });

  // Log errors when they occur
  useEffect(() => {
    if (query.error) {
      addLog(
        "error",
        `Failed to fetch transactions: ${query.error.message}`,
        "transactions",
        "useTransactions",
      );
    }
  }, [query.error, addLog]);

  // Flatten all pages into a single array
  const transactions = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    transactions,
  };
}
