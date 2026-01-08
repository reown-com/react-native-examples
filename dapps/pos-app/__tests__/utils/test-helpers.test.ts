/**
 * Test for test helpers
 * This verifies that our test utilities are working correctly
 */

import {
  createTestQueryClient,
  mockSecureStorage,
  mockStorage,
  resetTestMocks,
  createMockApiResponse,
  mockFetchResponse,
} from "./test-helpers";
import { resetAllStores } from "./store-helpers";

describe("Test Helpers", () => {
  beforeEach(() => {
    resetTestMocks();
    resetAllStores();
  });

  describe("createTestQueryClient", () => {
    it("creates a QueryClient with test-friendly defaults", () => {
      const client = createTestQueryClient();
      expect(client).toBeDefined();
      expect(client.getDefaultOptions().queries?.retry).toBe(false);
      expect(client.getDefaultOptions().queries?.gcTime).toBe(0); // gcTime replaces cacheTime in React Query v5
    });
  });

  describe("mockSecureStorage", () => {
    it("stores and retrieves items", async () => {
      await mockSecureStorage.setItem("test-key", "test-value");
      const value = await mockSecureStorage.getItem("test-key");
      expect(value).toBe("test-value");
    });

    it("returns null for non-existent keys", async () => {
      const value = await mockSecureStorage.getItem("non-existent");
      expect(value).toBeNull();
    });

    it("removes items", async () => {
      await mockSecureStorage.setItem("test-key", "test-value");
      await mockSecureStorage.removeItem("test-key");
      const value = await mockSecureStorage.getItem("test-key");
      expect(value).toBeNull();
    });

    it("clears all items", async () => {
      await mockSecureStorage.setItem("key1", "value1");
      await mockSecureStorage.setItem("key2", "value2");
      mockSecureStorage.clear();
      expect(await mockSecureStorage.getItem("key1")).toBeNull();
      expect(await mockSecureStorage.getItem("key2")).toBeNull();
    });
  });

  describe("mockStorage", () => {
    it("stores and retrieves items", () => {
      mockStorage.setItem("test-key", { foo: "bar" });
      const value = mockStorage.getItem("test-key");
      expect(value).toEqual({ foo: "bar" });
    });

    it("returns null for non-existent keys", () => {
      const value = mockStorage.getItem("non-existent");
      expect(value).toBeNull();
    });

    it("removes items", () => {
      mockStorage.setItem("test-key", "value");
      mockStorage.removeItem("test-key");
      expect(mockStorage.getItem("test-key")).toBeNull();
    });

    it("gets all keys", () => {
      mockStorage.setItem("key1", "value1");
      mockStorage.setItem("key2", "value2");
      const keys = mockStorage.getAllKeys();
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
    });

    it("clears all items", () => {
      mockStorage.setItem("key1", "value1");
      mockStorage.setItem("key2", "value2");
      mockStorage.clear();
      expect(mockStorage.getAllKeys()).toHaveLength(0);
    });
  });

  describe("createMockApiResponse", () => {
    it("creates a successful response", async () => {
      const response = createMockApiResponse({ data: "test" }, 200);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ data: "test" });
    });

    it("creates an error response", () => {
      const response = createMockApiResponse({ error: "Not found" }, 404);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe("mockFetchResponse", () => {
    it("mocks fetch with a response", async () => {
      mockFetchResponse({ success: true });
      const response = await fetch("https://api.test.com/endpoint");
      const data = await response.json();
      expect(data).toEqual({ success: true });
    });
  });
});
