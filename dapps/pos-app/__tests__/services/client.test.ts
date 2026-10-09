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

function okResponse(data: unknown, status = 200) {
  return {
    ok: true,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

describe("ApiClient", () => {
  beforeEach(() => {
    // Reset state
    resetLogsStore();
    jest.clearAllMocks();
  });

  describe("GET requests", () => {
    it("should make a GET request with correct URL", async () => {
      const mockData = { id: 1, name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse(mockData, 200),
      );

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
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse(mockData, 200),
      );

      await apiClient.get("endpoint-without-slash");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.example.com/endpoint-without-slash",
        expect.anything(),
      );
    });

    it("should pass custom headers", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(okResponse({}, 200));

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

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse(mockResponse, 200),
      );

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
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse({ success: true }, 200),
      );

      await apiClient.post("/empty-post");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should serialize request body correctly preserving types", async () => {
      const requestBody = {
        amount: "10.00", // String type should be preserved
        quantity: 5, // Number type should be preserved
        enabled: true, // Boolean type should be preserved
        metadata: { key: "value" }, // Nested object should be preserved
      };

      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options: RequestInit) => {
          // Validate the serialized body can be parsed back correctly
          const parsedBody = JSON.parse(options.body as string);
          expect(parsedBody).toEqual(requestBody);
          expect(typeof parsedBody.amount).toBe("string");
          expect(typeof parsedBody.quantity).toBe("number");
          expect(typeof parsedBody.enabled).toBe("boolean");
          expect(typeof parsedBody.metadata).toBe("object");

          return Promise.resolve(okResponse({ success: true }, 200));
        },
      );

      await apiClient.post("/typed-body", requestBody);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe("PUT requests", () => {
    it("should make a PUT request with JSON body", async () => {
      const requestBody = { name: "Updated Name" };
      const mockResponse = { id: 1, name: "Updated Name" };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse(mockResponse, 200),
      );

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
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse({ deleted: true }, 200),
      );

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
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse({ success: true }, 200),
      );

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
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse({ success: true }, 200),
      );

      await apiClient.get("/test");

      const logs = useLogsStore.getState().logs;
      const apiLog = logs.find((log) => log.message === "GET /test");
      expect(apiLog).toBeDefined();
      expect(apiLog?.level).toBe("info");
      expect(apiLog?.view).toBe("api");
      expect(apiLog?.data?.method).toBe("GET");
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

    it("should keep redacted request and response bodies out of the logs", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        okResponse({ email: "lea@example.com" }),
      );

      await apiClient.post(
        "/receipt",
        { email: "lea@example.com" },
        { redactLogBodies: true },
      );

      const logs = useLogsStore.getState().logs;
      expect(JSON.stringify(logs)).not.toContain("lea@example.com");
      const apiLog = logs.find((log) => log.message === "POST /receipt");
      expect(apiLog?.data?.body).toBe("[redacted]");
    });

    it("should keep redacted bodies out of error logs", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: jest.fn().mockResolvedValue({
          message: "Bad email",
          email: "lea@example.com",
        }),
      });

      await expect(
        apiClient.post(
          "/receipt",
          { email: "lea@example.com" },
          { redactLogBodies: true },
        ),
      ).rejects.toMatchObject({ status: 400 });

      const logs = useLogsStore.getState().logs;
      expect(JSON.stringify(logs)).not.toContain("lea@example.com");
    });

    it("should not log a server message that echoes a redacted body", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: "Unprocessable",
        json: jest
          .fn()
          .mockResolvedValue({ message: "Invalid email: lea@example.com" }),
      });

      await expect(
        apiClient.post(
          "/receipt",
          { email: "lea@example.com" },
          { redactLogBodies: true },
        ),
      ).rejects.toMatchObject({ status: 422 });

      const logs = useLogsStore.getState().logs;
      expect(JSON.stringify(logs)).not.toContain("lea@example.com");
      expect(
        logs.some((log) => log.message === "API request failed (422)"),
      ).toBe(true);
    });
  });

  describe("empty responses", () => {
    it("should resolve undefined for 204 No Content", async () => {
      const text = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: jest.fn().mockRejectedValue(new Error("no body")),
        text,
      });

      await expect(apiClient.post("/receipt", {})).resolves.toBeUndefined();
      expect(text).not.toHaveBeenCalled();
    });

    it("should reject a non-JSON 200 body as an API error with its status", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error("Unexpected token <")),
        text: jest.fn().mockResolvedValue("<html>Bad gateway</html>"),
      });

      await expect(apiClient.get("/test")).rejects.toEqual({
        message: "Invalid JSON response (status 200)",
        code: "INVALID_RESPONSE",
        status: 200,
      });
    });

    it("should resolve undefined for an empty 200 body", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error("Unexpected end of JSON")),
        text: jest.fn().mockResolvedValue(""),
      });

      await expect(apiClient.post("/receipt", {})).resolves.toBeUndefined();
    });
  });
});
