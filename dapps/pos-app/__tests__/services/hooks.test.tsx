/**
 * Payment Hooks Tests
 *
 * Tests for React Query hooks: useStartPayment and usePaymentStatus
 */

import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useStartPayment, usePaymentStatus } from "@/services/hooks";
import {
  resetSettingsStore,
  setupTestMerchant,
  clearTestMerchant,
} from "../utils/store-helpers";
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { startPayment, getPaymentStatus } from "@/services/payment";

// Mock the payment service functions
jest.mock("@/services/payment", () => ({
  startPayment: jest.fn(),
  getPaymentStatus: jest.fn(),
}));

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
    if (queryClient) {
      // Cancel any pending queries to prevent test pollution
      await queryClient.cancelQueries();
      queryClient.clear();
    }
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

    describe("polling behavior", () => {
      it("should stop polling when payment reaches terminal state (succeeded)", async () => {
        let callCount = 0;
        (getPaymentStatus as jest.Mock).mockImplementation(() => {
          callCount++;
          // Return processing for first 2 calls, then succeeded
          if (callCount < 3) {
            return Promise.resolve({
              status: "processing",
              isFinal: false,
              pollInMs: 100, // Short interval for testing
            });
          }
          return Promise.resolve({
            status: "succeeded",
            isFinal: true,
            pollInMs: 0,
          });
        });

        const { result } = renderHook(
          () => usePaymentStatus("pay_polling", { pollingInterval: 100 }),
          { wrapper: createWrapper() },
        );

        // Wait for terminal state
        await waitFor(
          () => {
            expect(result.current.data?.status).toBe("succeeded");
          },
          { timeout: 5000 },
        );

        // Verify polling occurred (at least 3 calls)
        expect(callCount).toBeGreaterThanOrEqual(3);

        // Store the call count
        const finalCallCount = callCount;

        // Wait a bit more to ensure polling stopped
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Call count should not have increased (polling stopped)
        expect(callCount).toBe(finalCallCount);
      });

      it("should stop polling when payment reaches terminal state (failed)", async () => {
        let callCount = 0;
        (getPaymentStatus as jest.Mock).mockImplementation(() => {
          callCount++;
          if (callCount < 2) {
            return Promise.resolve({
              status: "processing",
              isFinal: false,
              pollInMs: 100,
            });
          }
          return Promise.resolve({
            status: "failed",
            isFinal: true,
            pollInMs: 0,
          });
        });

        const { result } = renderHook(
          () => usePaymentStatus("pay_fail_poll", { pollingInterval: 100 }),
          { wrapper: createWrapper() },
        );

        await waitFor(
          () => {
            expect(result.current.data?.status).toBe("failed");
          },
          { timeout: 5000 },
        );

        expect(callCount).toBeGreaterThanOrEqual(2);
      });

      it("should call onTerminalState callback when polling completes", async () => {
        const onTerminalState = jest.fn();
        let callCount = 0;

        (getPaymentStatus as jest.Mock).mockImplementation(() => {
          callCount++;
          if (callCount < 2) {
            return Promise.resolve({
              status: "processing",
              isFinal: false,
              pollInMs: 100,
            });
          }
          return Promise.resolve({
            status: "succeeded",
            isFinal: true,
            pollInMs: 0,
          });
        });

        renderHook(
          () =>
            usePaymentStatus("pay_callback", {
              pollingInterval: 100,
              onTerminalState,
            }),
          { wrapper: createWrapper() },
        );

        await waitFor(
          () => {
            expect(onTerminalState).toHaveBeenCalled();
          },
          { timeout: 5000 },
        );

        expect(onTerminalState).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "succeeded",
            isFinal: true,
          }),
        );
        // Should only be called once
        expect(onTerminalState).toHaveBeenCalledTimes(1);
      });
    });
  });
});
