/**
 * Payment Service Tests
 *
 * Tests for the payment service functions including API headers, startPayment, and getPaymentStatus.
 */

import { getPaymentStatus, startPayment } from "@/services/payment";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  resetSettingsStore,
  setupTestMerchant,
  clearTestMerchant,
} from "../utils/store-helpers";

import { apiClient } from "@/services/client";

// Get the mocked secure store
const SecureStore = require("expo-secure-store");

// Mock the API client
jest.mock("@/services/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("Payment Service", () => {
  beforeEach(async () => {
    resetSettingsStore();
    // Clear secure storage mock between tests
    if (SecureStore.__clearMockStorage) {
      SecureStore.__clearMockStorage();
    }
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearTestMerchant();
  });

  describe("getApiHeaders (via startPayment/getPaymentStatus)", () => {
    it("should throw error when merchant ID is not configured", async () => {
      // Set API key but not merchant ID
      await SecureStore.setItemAsync("partner_api_key", "test-api-key");
      useSettingsStore.setState({
        merchantId: null,
        isPartnerApiKeySet: true,
      });

      await expect(
        startPayment({
          referenceId: "ref-123",
          amount: { value: "1000", unit: "cents" },
        }),
      ).rejects.toThrow("Merchant ID is not configured");
    });

    it("should throw error when merchant ID is empty string", async () => {
      await SecureStore.setItemAsync("partner_api_key", "test-api-key");
      useSettingsStore.setState({
        merchantId: "   ", // whitespace only
        isPartnerApiKeySet: true,
      });

      await expect(
        startPayment({
          referenceId: "ref-123",
          amount: { value: "1000", unit: "cents" },
        }),
      ).rejects.toThrow("Merchant ID is not configured");
    });

    it("should throw error when API key is not configured", async () => {
      useSettingsStore.setState({
        merchantId: "merchant-123",
        isPartnerApiKeySet: false,
      });
      // Don't set the API key in secure storage

      await expect(
        startPayment({
          referenceId: "ref-123",
          amount: { value: "1000", unit: "cents" },
        }),
      ).rejects.toThrow("Partner API key is not configured");
    });

    it("should include correct headers when merchant is configured", async () => {
      await setupTestMerchant("merchant-123", "api-key-456");

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        paymentId: "pay_123",
      });

      await startPayment({
        referenceId: "ref-123",
        amount: { value: "1000", unit: "cents" },
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/merchant/payment",
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Api-Key": "api-key-456",
            "Merchant-Id": "merchant-123",
            "Sdk-Name": "pos-device",
            "Sdk-Version": "1.0.0",
            "Sdk-Platform": "react-native",
          }),
        }),
      );
    });
  });

  describe("startPayment", () => {
    beforeEach(async () => {
      await setupTestMerchant("merchant-123", "api-key-456");
    });

    it("should call API with correct endpoint and body", async () => {
      const mockResponse = { paymentId: "pay_abc123" };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = {
        referenceId: "order-789",
        amount: { value: "2500", unit: "cents" },
      };

      const result = await startPayment(request);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/merchant/payment",
        request,
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error("Payment failed"),
      );

      const request = {
        referenceId: "order-failed",
        amount: { value: "1000", unit: "cents" },
      };

      await expect(startPayment(request)).rejects.toThrow("Payment failed");
    });

    it("should return payment ID from successful response", async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        paymentId: "pay_xyz789",
      });

      const request = {
        referenceId: "test-order",
        amount: { value: "5000", unit: "cents" },
      };

      const result = await startPayment(request);

      expect(result.paymentId).toBe("pay_xyz789");
    });
  });

  describe("getPaymentStatus", () => {
    beforeEach(async () => {
      await setupTestMerchant("merchant-123", "api-key-456");
    });

    it("should call API with correct endpoint", async () => {
      const mockResponse = {
        status: "processing",
        isFinal: false,
        pollInMs: 2000,
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getPaymentStatus("pay_123");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/merchant/payment/pay_123/status",
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when paymentId is empty", async () => {
      await expect(getPaymentStatus("")).rejects.toThrow(
        "paymentId is required",
      );
    });

    it("should throw error when paymentId is whitespace only", async () => {
      await expect(getPaymentStatus("   ")).rejects.toThrow(
        "paymentId is required",
      );
    });

    it("should throw error when paymentId is null/undefined", async () => {
      await expect(getPaymentStatus(null as unknown as string)).rejects.toThrow(
        "paymentId is required",
      );
      await expect(
        getPaymentStatus(undefined as unknown as string),
      ).rejects.toThrow("paymentId is required");
    });

    it("should return payment status from successful response", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: "succeeded",
        isFinal: true,
        pollInMs: 0,
      });

      const result = await getPaymentStatus("pay_success");

      expect(result.status).toBe("succeeded");
      expect(result.isFinal).toBe(true);
    });

    it("should handle different payment statuses", async () => {
      const statuses = [
        "requires_action",
        "processing",
        "succeeded",
        "failed",
        "expired",
      ] as const;

      for (const status of statuses) {
        (apiClient.get as jest.Mock).mockResolvedValueOnce({
          status,
          isFinal: ["succeeded", "failed", "expired"].includes(status),
          pollInMs: status === "succeeded" ? 0 : 2000,
        });

        const result = await getPaymentStatus(`pay_${status}`);
        expect(result.status).toBe(status);
      }
    });

    it("should handle API errors", async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error("Payment not found"),
      );

      await expect(getPaymentStatus("pay_invalid")).rejects.toThrow(
        "Payment not found",
      );
    });
  });
});
