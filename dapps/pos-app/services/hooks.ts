import { useLogsStore } from "@/store/useLogsStore";
import {
  PaymentRecord,
  PaymentStatus,
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
  TransactionFilterType,
  TransactionsResponse,
} from "@/utils/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getPaymentStatus, startPayment } from "./payment";
import { getTransactions, GetTransactionsOptions } from "./transactions";

/**
 * Terminal payment statuses that indicate polling should stop
 */
const TERMINAL_STATUSES: PaymentStatus[] = ["succeeded", "failed", "expired"];

/**
 * Hook to start a payment
 * @returns Mutation hook for starting payments
 */
export function useStartPayment() {
  return useMutation<StartPaymentResponse, Error, StartPaymentRequest>({
    mutationFn: startPayment,
  });
}

interface UsePaymentStatusOptions {
  /**
   * Polling interval in milliseconds
   * @default 2000 (2 seconds)
   */
  pollingInterval?: number;
  /**
   * Whether to enable the query
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when payment reaches a terminal state
   */
  onTerminalState?: (data: PaymentStatusResponse) => void;
}

/**
 * Hook to get payment status with automatic polling
 * Polls until payment reaches a terminal state (completed or failed)
 * @param paymentId - The payment ID to check status for
 * @param options - Query options including polling interval
 * @returns Query result with payment status data
 */
export function usePaymentStatus(
  paymentId: string | null | undefined,
  options: UsePaymentStatusOptions = {},
) {
  const {
    pollingInterval = 2000,
    enabled = true,
    onTerminalState,
    ...queryOptions
  } = options;

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
    queryFn: () => {
      if (!paymentId) throw new Error("Payment ID required");
      return getPaymentStatus(paymentId);
    },
    enabled: enabled && !!paymentId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if payment has reached a terminal state
      if (data && TERMINAL_STATUSES.includes(data.status)) {
        return false;
      }
      return pollingInterval;
    },

    // Let failed requests retry naturally
    retry: 3,
    ...queryOptions,
  });

  // Handle terminal state callback
  useEffect(() => {
    const data = query.data;
    if (
      data &&
      TERMINAL_STATUSES.includes(data.status) &&
      !hasCalledCallback.current &&
      callbackRef.current
    ) {
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
   * Additional query options for the API
   */
  queryOptions?: GetTransactionsOptions;
}

/**
 * Maps UI filter type to API status values
 */
function filterToStatusArray(
  filter: TransactionFilterType,
): string[] | undefined {
  switch (filter) {
    case "completed":
      return ["succeeded"];
    case "failed":
      return ["failed", "expired"];
    case "pending":
      return ["requires_action", "processing"];
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
  const { enabled = true, filter = "all", queryOptions = {} } = options;

  const addLog = useLogsStore.getState().addLog;

  const query = useInfiniteQuery<TransactionsResponse, Error>({
    queryKey: ["transactions", filter, queryOptions],
    queryFn: ({ pageParam }) => {
      const statusFilter = filterToStatusArray(filter);
      return getTransactions({
        ...queryOptions,
        status: statusFilter,
        sortBy: "date",
        sortDir: "desc",
        limit: 20,
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
    meta: {
      onError: (error: Error) => {
        addLog(
          "error",
          `Failed to fetch transactions: ${error.message}`,
          "transactions",
          "useTransactions",
        );
      },
    },
  });

  // Flatten all pages into a single array
  const transactions = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    transactions,
  };
}
