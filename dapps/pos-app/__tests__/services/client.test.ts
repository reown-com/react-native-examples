/**
 * API Client Tests
 *
 * Tests for the ApiClient class that handles HTTP requests to the payment API.
 */

import { ApiError } from "@/utils/types";
import { useLogsStore } from "@/store/useLogsStore";
import { resetLogsStore } from "../utils/store-helpers";

// Import the client - environment variable is set in jest.setup.js
import { apiClient } from "@/services/client";

describe("ApiClient", () => {
  beforeEach(() => {
    // Reset state
    resetLogsStore();
    jest.clearAllMocks();
  });

  describe("GET requests", () => {
    it("should make a GET request with correct URL", async () => {
      const mockData = { id: 1, name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await apiClient.get("/test-endpoint");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.example.com/test-endpoint",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("should normalize URL - handle endpoint without leading slash", async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      });

      await apiClient.get("endpoint-without-slash");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.example.com/endpoint-without-slash",
        expect.anything(),
      );
    });

    it("should pass custom headers", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });

      await apiClient.get("/test", {
        headers: { Authorization: "Bearer token123" },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
            "Content-Type": "application/json",
          }),
        }),
      );
    });
  });

  describe("POST requests", () => {
    it("should make a POST request with JSON body", async () => {
      const requestBody = { amount: "10.00", currency: "USD" };
      const mockResponse = { paymentId: "pay_123" };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.post("/payments", requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.example.com/payments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle POST request without body", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.post("/empty-post");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });

  describe("PUT requests", () => {
    it("should make a PUT request with JSON body", async () => {
      const requestBody = { name: "Updated Name" };
      const mockResponse = { id: 1, name: "Updated Name" };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.put("/resource/1", requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.example.com/resource/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(requestBody),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("DELETE requests", () => {
    it("should make a DELETE request", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ deleted: true }),
      });

      const result = await apiClient.delete("/resource/1");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.example.com/resource/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
      expect(result).toEqual({ deleted: true });
    });
  });

  describe("error handling", () => {
    it("should throw ApiError for non-ok response with JSON error body", async () => {
      const errorBody = { message: "Invalid request", code: "INVALID_REQUEST" };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: jest.fn().mockResolvedValue(errorBody),
      });

      await expect(apiClient.get("/bad-request")).rejects.toMatchObject({
        message: "Invalid request",
        code: "INVALID_REQUEST",
        status: 400,
      } as ApiError);
    });

    it("should throw ApiError with status text when JSON parsing fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });

      await expect(apiClient.get("/server-error")).rejects.toMatchObject({
        message: "Internal Server Error",
        status: 500,
      } as ApiError);
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(apiClient.get("/network-fail")).rejects.toMatchObject({
        message: "Network error",
      } as ApiError);
    });

    it("should handle non-Error throws", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce("string error");

      await expect(apiClient.get("/string-error")).rejects.toMatchObject({
        message: "An unexpected error occurred",
      } as ApiError);
    });

    it("should use default error message for response without message", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(apiClient.get("/not-found")).rejects.toMatchObject({
        message: "HTTP error! status: 404",
        status: 404,
      } as ApiError);
    });
  });

  describe("timeout handling", () => {
    it("should use AbortController signal for fetch", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.get("/test");

      // Verify fetch was called with an AbortSignal
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it("should handle AbortError as timeout", async () => {
      // Simulate an AbortError (what happens when fetch is aborted)
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(apiClient.get("/aborted-request")).rejects.toMatchObject({
        message: expect.stringMatching(/timeout/i),
        code: "TIMEOUT",
      });
    });

    it("should log timeout errors", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      try {
        await apiClient.get("/timeout-endpoint");
      } catch {
        // Expected
      }

      const logs = useLogsStore.getState().logs;
      const timeoutLog = logs.find((log) =>
        log.message.toLowerCase().includes("timeout"),
      );
      expect(timeoutLog).toBeDefined();
      expect(timeoutLog?.level).toBe("error");
    });
  });

  describe("logging", () => {
    it("should log successful API requests", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      await apiClient.get("/test");

      const logs = useLogsStore.getState().logs;
      const apiLog = logs.find(
        (log) => log.message === "API request successful",
      );
      expect(apiLog).toBeDefined();
      expect(apiLog?.level).toBe("info");
      expect(apiLog?.view).toBe("api");
    });

    it("should log failed API requests", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: jest.fn().mockResolvedValue({ message: "Something went wrong" }),
      });

      try {
        await apiClient.get("/error");
      } catch {
        // Expected to throw
      }

      const logs = useLogsStore.getState().logs;
      const errorLog = logs.find((log) => log.level === "error");
      expect(errorLog).toBeDefined();
      expect(errorLog?.view).toBe("api");
    });
  });
});
