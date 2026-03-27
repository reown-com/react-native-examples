# Test Utilities Documentation

This directory contains test utilities and helpers for the POS app test suite.

## Test Utilities

### `test-helpers.tsx`

Provides utilities for testing React components and API interactions:

- **`createTestQueryClient()`**: Creates a QueryClient configured for testing (no retries, no cache)
- **`renderWithProviders()`**: Custom render function that wraps components with QueryClientProvider
- **`waitForAsync()`**: Helper to wait for async operations
- **`mockSecureStorage`**: In-memory mock for expo-secure-store
- **`mockStorage`**: In-memory mock for MMKV storage
- **`resetTestMocks()`**: Clears all mocks and storage
- **`createMockApiResponse()`**: Creates a mock fetch Response
- **`mockFetchResponse()`**: Mocks global.fetch with a response
- **`mockFetchError()`**: Mocks global.fetch with an error

### `store-helpers.ts`

Provides utilities for testing Zustand stores:

- **`resetSettingsStore()`**: Resets useSettingsStore to initial state
- **`resetLogsStore()`**: Resets useLogsStore to initial state
- **`resetAllStores()`**: Resets all stores
- **`setupTestMerchant()`**: Sets up a test merchant configuration
- **`clearTestMerchant()`**: Clears test merchant configuration

## Usage Examples

### Testing a Component with Providers

```typescript
import { renderWithProviders } from "@/__tests__/utils";
import { MyComponent } from "@/components/my-component";

test("renders component", () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText("Hello")).toBeTruthy();
});
```

### Testing with Store State

```typescript
import { resetAllStores, setupTestMerchant } from "@/__tests__/utils";
import { useSettingsStore } from "@/store/useSettingsStore";

beforeEach(() => {
  resetAllStores();
});

test("merchant configuration", async () => {
  await setupTestMerchant("merchant-123", "api-key-456");
  const merchantId = useSettingsStore.getState().merchantId;
  expect(merchantId).toBe("merchant-123");
});
```

### Mocking API Calls

```typescript
import { mockFetchResponse } from "@/__tests__/utils";

test("API call", async () => {
  mockFetchResponse({ success: true });
  const result = await fetch("https://api.example.com/data");
  const data = await result.json();
  expect(data.success).toBe(true);
});
```

## Jest Configuration

The Jest configuration is set up in:

- `jest.config.js`: Main Jest configuration
- `jest.setup.js`: Global test setup with mocks

## Mocked Modules

The following modules are automatically mocked in `jest.setup.js`:

- `react-native` - React Native core modules
- `expo-secure-store` - Secure storage
- `expo-crypto` - Cryptographic functions
- `expo-local-authentication` - Biometric authentication
- `react-native-device-info` - Device information
- `react-native-mmkv` - MMKV storage
- `expo-router` - Navigation
- `react-native-reanimated` - Animations
- `@shopify/react-native-skia` - Skia graphics
- `react-native-qrcode-skia` - QR code generation
- `react-native-thermal-pos-printer` - Printer integration
- `react-native-toast-message` - Toast notifications
- `expo-constants` - App constants
- `expo-application` - Application info

## Best Practices

1. **Always reset stores and mocks in `beforeEach`**:

   ```typescript
   beforeEach(() => {
     resetAllStores();
     resetTestMocks();
   });
   ```

2. **Use `renderWithProviders` for components that use React Query**:

   ```typescript
   const { queryClient } = renderWithProviders(<Component />);
   ```

3. **Mock API calls at the test level**:

   ```typescript
   test("handles API error", () => {
     mockFetchError(new Error("Network error"));
     // test error handling
   });
   ```

4. **Clean up after tests**:
   ```typescript
   afterEach(() => {
     resetTestMocks();
   });
   ```
