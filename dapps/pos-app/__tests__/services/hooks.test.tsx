/**
 * Payment Hooks Tests
 *
 * Tests for React Query hooks: useStartPayment and usePaymentStatus
 */

import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useStartPayment, usePaymentStatus } from "@/services/hooks";
import { createTestQueryClient } from "../utils";
import {
  resetSettingsStore,
  setupTestMerchant,
  clearTestMerchant,
} from "../utils/store-helpers";
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Mock the payment service functions
jest.mock("@/services/payment", () => ({
  startPayment: jest.fn(),
  getPaymentStatus: jest.fn(),
}));

import { startPayment, getPaymentStatus } from "@/services/payment";

describe("Payment Hooks", () => {
  let queryClient: QueryClient;

  // Create wrapper with QueryClient
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  beforeEach(async () => {
    resetSettingsStore();
    jest.clearAllMocks();
    await setupTestMerchant("merchant-123", "api-key-456");
  });

  afterEach(async () => {
    await clearTestMerchant();
    queryClient?.clear();
  });

  describe("useStartPayment", () => {
    it("should return a mutation object with expected properties", () => {
      const { result } = renderHook(() => useStartPayment(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutate).toBe("function");
      expect(typeof result.current.mutateAsync).toBe("function");
    });

    it("should have idle state initially", () => {
      const { result } = renderHook(() => useStartPayment(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isIdle).toBe(true);
    });

    it("should call startPayment when mutate is called", async () => {
      (startPayment as jest.Mock).mockResolvedValue({
        paymentId: "pay_123",
      });

      const { result } = renderHook(() => useStartPayment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          referenceId: "order-123",
          amount: { value: "1000", unit: "cents" },
        });
      });

      // Verify startPayment was called - the first argument should be our request
      expect(startPayment).toHaveBeenCalled();
      const callArgs = (startPayment as jest.Mock).mock.calls[0][0];
      expect(callArgs).toEqual({
        referenceId: "order-123",
        amount: { value: "1000", unit: "cents" },
      });
    });

    it("should return data on success", async () => {
      (startPayment as jest.Mock).mockResolvedValue({
        paymentId: "pay_success",
      });

      const { result } = renderHook(() => useStartPayment(), {
        wrapper: createWrapper(),
      });

      let data: { paymentId: string } | undefined;
      await act(async () => {
        data = await result.current.mutateAsync({
          referenceId: "order-123",
          amount: { value: "1000", unit: "cents" },
        });
      });

      // The mutateAsync returns the data directly
      expect(data).toEqual({ paymentId: "pay_success" });
    });

    it("should set error on failure", async () => {
      const error = new Error("Payment failed");
      (startPayment as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useStartPayment(), {
        wrapper: createWrapper(),
      });

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.mutateAsync({
            referenceId: "order-error",
            amount: { value: "500", unit: "cents" },
          });
        } catch (e) {
          thrownError = e as Error;
        }
      });

      // Verify the error was thrown
      expect(thrownError).toBe(error);
    });
  });

  describe("usePaymentStatus", () => {
    it("should not fetch when paymentId is null", () => {
      const { result } = renderHook(
        () => usePaymentStatus(null, { enabled: true }),
        { wrapper: createWrapper() },
      );

      expect(getPaymentStatus).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.isFetching).toBe(false);
    });

    it("should not fetch when paymentId is undefined", () => {
      const { result } = renderHook(
        () => usePaymentStatus(undefined, { enabled: true }),
        { wrapper: createWrapper() },
      );

      expect(getPaymentStatus).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });

    it("should not fetch when enabled is false", () => {
      const { result } = renderHook(
        () => usePaymentStatus("pay_123", { enabled: false }),
        { wrapper: createWrapper() },
      );

      expect(getPaymentStatus).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });

    it("should start fetching when paymentId is provided and enabled", async () => {
      (getPaymentStatus as jest.Mock).mockResolvedValue({
        status: "processing",
        isFinal: false,
        pollInMs: 2000,
      });

      const { result } = renderHook(
        () => usePaymentStatus("pay_123", { enabled: true }),
        { wrapper: createWrapper() },
      );

      // Initially should be loading
      expect(result.current.isPending || result.current.isFetching).toBe(true);

      // Wait for the fetch to complete
      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 5000 },
      );

      expect(getPaymentStatus).toHaveBeenCalledWith("pay_123");
      expect(result.current.data?.status).toBe("processing");
    });

    it("should handle succeeded status", async () => {
      (getPaymentStatus as jest.Mock).mockResolvedValue({
        status: "succeeded",
        isFinal: true,
        pollInMs: 0,
      });

      const { result } = renderHook(() => usePaymentStatus("pay_success"), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 5000 },
      );

      expect(result.current.data?.status).toBe("succeeded");
      expect(result.current.data?.isFinal).toBe(true);
    });

    it("should handle failed status", async () => {
      (getPaymentStatus as jest.Mock).mockResolvedValue({
        status: "failed",
        isFinal: true,
        pollInMs: 0,
      });

      const { result } = renderHook(() => usePaymentStatus("pay_failed"), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 5000 },
      );

      expect(result.current.data?.status).toBe("failed");
    });

    it("should handle expired status", async () => {
      (getPaymentStatus as jest.Mock).mockResolvedValue({
        status: "expired",
        isFinal: true,
        pollInMs: 0,
      });

      const { result } = renderHook(() => usePaymentStatus("pay_expired"), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 5000 },
      );

      expect(result.current.data?.status).toBe("expired");
    });
  });
});
