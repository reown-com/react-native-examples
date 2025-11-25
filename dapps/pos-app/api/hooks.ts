import {
  PaymentStatus,
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getPaymentStatus, startPayment } from "./payment";

/**
 * Terminal payment statuses that indicate polling should stop
 */
const TERMINAL_STATUSES: PaymentStatus[] = ["completed", "failed"];

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
      return getPaymentStatus(paymentId!);
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
