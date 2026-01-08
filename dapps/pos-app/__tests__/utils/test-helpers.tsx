/**
 * Test Utilities and Helpers
 * Reusable functions and components for testing
 */

import React from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Create a test QueryClient with default options for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // gcTime replaces cacheTime in React Query v5
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Custom render function that includes providers
 * Use this instead of the default render from @testing-library/react-native
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Wait for async operations to complete
 * Useful for waiting for state updates or async functions
 */
export function waitForAsync() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Mock implementation of secure storage for testing
 */
export const mockSecureStorage = {
  storage: new Map<string, string>(),

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  },

  clear(): void {
    this.storage.clear();
  },
};

/**
 * Mock implementation of regular storage (MMKV) for testing
 */
export const mockStorage = {
  storage: new Map<string, string>(),

  getItem<T = any>(key: string): T | null {
    const item = this.storage.get(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  setItem<T = any>(key: string, value: T): void {
    this.storage.set(key, JSON.stringify(value));
  },

  removeItem(key: string): void {
    this.storage.delete(key);
  },

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  },

  clear(): void {
    this.storage.clear();
  },
};

/**
 * Reset all mocks and storage between tests
 */
export function resetTestMocks() {
  mockSecureStorage.clear();
  mockStorage.clear();

  // Reset fetch mock
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockClear();
  }
}

/**
 * Create a mock API response
 */
export function createMockApiResponse<T>(
  data: T,
  status: number = 200,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  } as unknown as Response;
}

/**
 * Mock fetch with a response
 */
export function mockFetchResponse<T>(data: T, status: number = 200) {
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockApiResponse(data, status),
    );
  }
}

/**
 * Mock fetch with an error
 */
export function mockFetchError(error: Error) {
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);
  }
}
