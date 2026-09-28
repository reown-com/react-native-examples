import {
  PaymentStatusResponse,
  StartPaymentRequest,
  StartPaymentResponse,
} from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { cancelPayment, getPaymentStatus, startPayment } from "./payment";

const KNOWN_STATUSES: string[] = [
  "requires_action",
  "processing",
  "succeeded",
  "failed",
  "expired",
  "cancelled",
];

/**
 * Normalize a status response — unknown statuses become a final "failed" so
 * the UI stops polling and routes through the failure path.
 */
export function normalizePaymentStatus(
  data: PaymentStatusResponse,
): PaymentStatusResponse {
  if (!KNOWN_STATUSES.includes(data.status as string)) {
    return { ...data, status: "failed", isFinal: true };
  }
  return data;
}

export function useStartPayment() {
  return useMutation<StartPaymentResponse, Error, StartPaymentRequest>({
    mutationFn: startPayment,
  });
}

export function useCancelPayment() {
  return useMutation<void, Error, string>({
    mutationFn: cancelPayment,
  });
}

interface UsePaymentStatusOptions {
  enabled?: boolean;
  onTerminalState?: (data: PaymentStatusResponse) => void;
}

/**
 * Poll a payment's status until it reaches a final state. Poll cadence follows
 * the API's `pollInMs` (default 2s). Unknown statuses are normalized to failed.
 */
export function usePaymentStatus(
  paymentId: string | null | undefined,
  options: UsePaymentStatusOptions = {},
) {
  const { enabled = true, onTerminalState } = options;

  const hasCalledCallback = useRef(false);
  const callbackRef = useRef(onTerminalState);
  const previousPaymentIdRef = useRef(paymentId);

  useEffect(() => {
    callbackRef.current = onTerminalState;
  }, [onTerminalState]);

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
      if (data?.isFinal) return false;
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
    retry: 3,
  });

  useEffect(() => {
    const data = query.data;
    if (data?.isFinal && !hasCalledCallback.current && callbackRef.current) {
      hasCalledCallback.current = true;
      callbackRef.current(data);
    }
  }, [query.data]);

  return query;
}
