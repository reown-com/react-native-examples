# Testing Plan for POS App

## Overview

This document outlines a comprehensive testing strategy for the WPay Mobile POS React Native application. The plan focuses on unit tests, integration tests, and component tests, excluding e2e tests for now.

## Current State

- **Jest** is configured with `react-native` preset
- **One existing test**: `utils/currency.test.ts` (good example of test structure)
- **Test command**: `npm test` (configured in package.json)

## Testing Strategy

### Test Categories

1. **Unit Tests**: Test individual functions, utilities, and pure logic
2. **Component Tests**: Test React components in isolation
3. **Hook Tests**: Test custom React hooks
4. **Integration Tests**: Test interactions between modules (stores, services, hooks)
5. **Service Tests**: Test API client and service functions with mocked HTTP calls

### Testing Libraries Needed

#### Required Dependencies
```json
{
  "@testing-library/react-native": "^12.x",
  "@testing-library/jest-native": "^5.x",
  "@testing-library/react-hooks": "^8.x", // or use @testing-library/react-native's renderHook
  "jest-mock": "^29.x", // Usually included with Jest
  "@react-native-async-storage/async-storage": "^1.x" // For storage mocking
}
```

#### Optional but Recommended
```json
{
  "react-test-renderer": "^19.x", // Usually included with React Native
  "msw": "^2.x" // Mock Service Worker for API mocking
}
```

## Test Structure

```
pos-app/
├── __tests__/              # Co-located tests (preferred)
│   ├── utils/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── store/
├── utils/
│   ├── currency.ts
│   └── currency.test.ts    # Existing test (co-located)
└── jest.setup.js           # Jest configuration and mocks
```

## Priority Levels

### 🔴 High Priority (Critical Business Logic)
- Payment flow logic
- Currency calculations
- PIN verification and lockout
- API client error handling
- Store state management

### 🟡 Medium Priority (User-Facing Features)
- Component rendering and interactions
- Form validation
- Navigation helpers
- Theme/variant system
- Biometric authentication flow

### 🟢 Low Priority (Nice to Have)
- Utility helpers
- Date formatting
- Logging functionality
- Printer utilities (hard to test without hardware)

## Detailed Test Plan

### 1. Utility Functions (`utils/`)

#### ✅ Already Tested
- `currency.ts` - `dollarsToCents` function

#### 🔴 High Priority
- **`currency.ts`** (complete coverage)
  - [ ] `formatCurrency` function (if exists)
  - [ ] Edge cases for currency formatting
  - [ ] Negative amounts handling

- **`misc.ts`**
  - [ ] `getDate()` - Date formatting
  - [ ] `getDeviceIdentifier()` - Device ID retrieval with error handling

- **`payment-errors.ts`**
  - [ ] Error message mapping
  - [ ] Error code handling

#### 🟡 Medium Priority
- **`networks.ts`**
  - [ ] Network name mapping
  - [ ] Network configuration

- **`navigation.ts`**
  - [ ] Navigation helper functions
  - [ ] Route parameter handling

- **`types.ts`**
  - [ ] Type validation utilities (if any)

#### 🟢 Low Priority
- **`toast.ts`** - Toast utility functions
- **`printer.ts`** - Printer utilities (may require hardware mocking)

### 2. Components (`components/`)

#### 🔴 High Priority
- **`numeric-keyboard.tsx`**
  - [ ] Number input handling
  - [ ] Decimal point logic
  - [ ] Backspace functionality
  - [ ] Disabled state

- **`pin-modal.tsx`**
  - [ ] PIN input handling
  - [ ] PIN verification flow
  - [ ] Error state display
  - [ ] Lockout message display

- **`qr-code.tsx`**
  - [ ] QR code rendering
  - [ ] Props handling
  - [ ] Error states

#### 🟡 Medium Priority
- **`button.tsx`**
  - [ ] Press handling
  - [ ] Disabled state
  - [ ] Style application

- **`dropdown.tsx`**
  - [ ] Option selection
  - [ ] Dropdown open/close
  - [ ] Value display

- **`card.tsx`**
  - [ ] Rendering with props
  - [ ] Style application

- **`switch.tsx`**
  - [ ] Toggle functionality
  - [ ] Value changes

- **`themed-text.tsx`**
  - [ ] Theme color application
  - [ ] Variant color support

- **`close-button.tsx`**
  - [ ] Press handling
  - [ ] Icon rendering

#### 🟢 Low Priority
- **`header-image.tsx`** - Logo rendering
- **`shimmer.tsx`** - Loading animation
- **`toast.tsx`** - Toast component rendering
- **`walletconnect-loading.tsx`** - Loading animation

### 3. Custom Hooks (`hooks/`)

#### 🔴 High Priority
- **`use-merchant-flow.ts`**
  - [ ] Merchant validation logic
  - [ ] Flow state management
  - [ ] Error handling

- **`use-biometric-auth.ts`**
  - [ ] Biometric availability check
  - [ ] Authentication flow
  - [ ] Error handling

#### 🟡 Medium Priority
- **`use-theme-color.ts`**
  - [ ] Theme color retrieval
  - [ ] Variant color override
  - [ ] Light/dark mode switching

- **`use-color-scheme.ts`**
  - [ ] System color scheme detection
  - [ ] Manual override

- **`use-disable-back-button.ts`**
  - [ ] Back button disabling
  - [ ] Cleanup on unmount

### 4. State Management (`store/`)

#### 🔴 High Priority
- **`useSettingsStore.ts`**
  - [ ] Initial state
  - [ ] `setThemeMode` - Theme switching
  - [ ] `setVariant` - Variant selection with theme override
  - [ ] `setMerchantId` / `clearMerchantId` - Merchant ID management
  - [ ] `setMerchantApiKey` / `clearMerchantApiKey` - API key management (mocked secure storage)
  - [ ] `getMerchantApiKey` - API key retrieval
  - [ ] `setPin` - PIN hashing and storage
  - [ ] `verifyPin` - PIN verification logic
  - [ ] `verifyPin` - Failed attempt tracking
  - [ ] `verifyPin` - Lockout after MAX_PIN_ATTEMPTS
  - [ ] `isLockedOut` - Lockout state check
  - [ ] `getLockoutRemainingSeconds` - Lockout timer calculation
  - [ ] `resetPinAttempts` - Reset functionality
  - [ ] `isPinSet` - PIN existence check
  - [ ] `setBiometricEnabled` - Biometric toggle
  - [ ] `getVariantPrinterLogo` - Logo retrieval
  - [ ] Store persistence and hydration
  - [ ] Migration logic (version 9)

- **`useLogsStore.ts`**
  - [ ] `addLog` - Log entry creation
  - [ ] `addLog` - MAX_LOGS_COUNT limit enforcement
  - [ ] `clearLogs` - Log clearing
  - [ ] Store persistence
  - [ ] Log level handling

### 5. Services (`services/`)

#### 🔴 High Priority
- **`client.ts`**
  - [ ] API client initialization
  - [ ] Request interceptors
  - [ ] Response interceptors
  - [ ] Error handling
  - [ ] Base URL configuration

- **`payment.ts`**
  - [ ] `getApiHeaders` - Header generation
  - [ ] `getApiHeaders` - Missing merchant ID error
  - [ ] `getApiHeaders` - Missing API key error
  - [ ] `startPayment` - Payment request creation
  - [ ] `startPayment` - Error handling
  - [ ] `getPaymentStatus` - Status retrieval
  - [ ] `getPaymentStatus` - Invalid paymentId error
  - [ ] `getPaymentStatus` - Error handling

- **`hooks.ts`**
  - [ ] `usePaymentStatus` hook - Polling logic
  - [ ] `usePaymentStatus` hook - Enabled/disabled state
  - [ ] `usePaymentStatus` hook - Error handling
  - [ ] `useStartPayment` hook - Mutation handling

#### 🟡 Medium Priority
- **`payment.web.ts`** (if different from payment.ts)
  - [ ] Web-specific payment logic

## Test Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up testing infrastructure and establish patterns

1. **Install testing dependencies**
   ```bash
   npm install --save-dev @testing-library/react-native @testing-library/jest-native
   ```

2. **Create Jest setup file** (`jest.setup.js`)
   - Mock React Native modules
   - Mock Expo modules (secure-store, crypto, etc.)
   - Configure test environment
   - Set up global test utilities

3. **Update Jest config** (`jest.config.js`)
   - Add setupFilesAfterEnv
   - Configure module name mapping (@/ alias)
   - Add transformIgnorePatterns for node_modules

4. **Create test utilities**
   - Mock helpers for stores
   - Mock helpers for secure storage
   - Mock helpers for API client
   - Test render wrapper with providers

### Phase 2: Critical Path Testing (Week 2-3)
**Goal**: Test core business logic and payment flow

1. **Complete utility tests**
   - Finish `currency.ts` tests
   - Add `misc.ts` tests
   - Add `payment-errors.ts` tests

2. **Store tests**
   - `useSettingsStore.ts` - All methods
   - `useLogsStore.ts` - All methods

3. **Service tests**
   - `client.ts` - API client setup
   - `payment.ts` - Payment functions with mocked HTTP
   - `hooks.ts` - React Query hooks

### Phase 3: Component Testing (Week 4-5)
**Goal**: Test user-facing components

1. **Form components**
   - `numeric-keyboard.tsx`
   - `pin-modal.tsx`
   - `dropdown.tsx`

2. **UI components**
   - `button.tsx`
   - `card.tsx`
   - `switch.tsx`
   - `themed-text.tsx`

3. **Feature components**
   - `qr-code.tsx`

### Phase 4: Hook Testing (Week 6)
**Goal**: Test custom hooks

1. **Business logic hooks**
   - `use-merchant-flow.ts`
   - `use-biometric-auth.ts`

2. **UI hooks**
   - `use-theme-color.ts`
   - `use-color-scheme.ts`
   - `use-disable-back-button.ts`

### Phase 5: Integration & Polish (Week 7)
**Goal**: Integration tests and coverage improvement

1. **Integration tests**
   - Payment flow integration (amount → scan → success)
   - Settings flow integration
   - PIN setup and verification flow

2. **Coverage analysis**
   - Run coverage report
   - Identify gaps
   - Add missing tests

3. **Documentation**
   - Update README with testing instructions
   - Document test patterns and conventions

## Jest Configuration

### Recommended `jest.config.js` Updates

```javascript
module.exports = {
  preset: "react-native",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation|@tanstack|zustand)/)",
  ],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/jest.setup.js",
    "!**/index.ts",
    "!**/index.web.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## Mocking Strategy

### React Native Modules
- `react-native` - Use `react-native` preset (already configured)
- `expo-secure-store` - Mock with in-memory storage
- `expo-crypto` - Mock hash functions
- `expo-local-authentication` - Mock biometric functions
- `react-native-device-info` - Mock device ID
- `react-native-thermal-pos-printer` - Mock printer functions

### External Libraries
- `@tanstack/react-query` - Use `QueryClient` with test configuration
- `zustand` - Test with actual store (no mocking needed)
- `expo-router` - Mock router functions

### API Client
- Use MSW (Mock Service Worker) for HTTP mocking
- Or use Jest's `jest.mock()` for `services/client.ts`

## Test Patterns

### Component Test Pattern
```typescript
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "@/components/button";

describe("Button", () => {
  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress}>Click me</Button>);
    
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Test Pattern
```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useSettingsStore } from "@/store/useSettingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset store state
    useSettingsStore.setState({
      themeMode: "light",
      // ... other defaults
    });
  });

  it("sets theme mode", () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.setThemeMode("dark");
    });
    
    expect(result.current.themeMode).toBe("dark");
  });
});
```

### Service Test Pattern
```typescript
import { apiClient } from "@/services/client";
import { startPayment } from "@/services/payment";

jest.mock("@/services/client");

describe("startPayment", () => {
  it("calls API with correct headers", async () => {
    const mockPost = jest.fn().mockResolvedValue({ paymentId: "123" });
    (apiClient.post as jest.Mock) = mockPost;
    
    await startPayment({ amount: "10.00" });
    
    expect(mockPost).toHaveBeenCalledWith(
      "/merchant/payment",
      { amount: "10.00" },
      expect.objectContaining({
        headers: expect.objectContaining({
          "Api-Key": expect.any(String),
          "Merchant-Id": expect.any(String),
        }),
      })
    );
  });
});
```

## Coverage Goals

### Initial Goals (Phase 1-3)
- **Critical paths**: 80%+ coverage
  - Payment flow
  - PIN verification
  - Store state management
  - API services

### Target Goals (Phase 4-5)
- **Overall**: 70%+ coverage
- **Components**: 60%+ coverage
- **Utilities**: 80%+ coverage
- **Stores**: 85%+ coverage
- **Services**: 75%+ coverage

## Continuous Integration

### Pre-commit Hooks (Recommended)
- Run tests before commit
- Check coverage thresholds
- Lint test files

### CI/CD Integration
- Run test suite on PR
- Generate coverage reports
- Fail build if coverage drops below threshold

## Testing Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing internal implementation details

2. **Use Descriptive Test Names**
   - Follow pattern: "should [expected behavior] when [condition]"
   - Example: "should lock user out after 3 failed PIN attempts"

3. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data and mocks
   - Act: Execute the code under test
   - Assert: Verify the results

4. **Keep Tests Isolated**
   - Each test should be independent
   - Reset state between tests
   - Don't rely on test execution order

5. **Mock External Dependencies**
   - Mock API calls
   - Mock native modules
   - Mock secure storage

6. **Test Edge Cases**
   - Empty inputs
   - Invalid inputs
   - Error conditions
   - Boundary values

7. **Avoid Testing Third-Party Libraries**
   - Don't test React Native, Expo, or Zustand internals
   - Test how you use them, not their implementation

## Next Steps

1. **Review and approve this plan**
2. **Install testing dependencies** (Phase 1)
3. **Set up Jest configuration** (Phase 1)
4. **Create first test** (Phase 2 - start with stores)
5. **Iterate and expand** (Phases 2-5)

## Questions & Considerations

- **Hardware dependencies**: Printer tests may require special mocking
- **Biometric tests**: May need platform-specific mocks
- **Navigation tests**: Expo Router testing may require additional setup
- **Animation tests**: Reanimated animations may need special handling
- **Skia tests**: QR code rendering with Skia may need canvas mocking

## Resources

- [React Native Testing Library Docs](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
