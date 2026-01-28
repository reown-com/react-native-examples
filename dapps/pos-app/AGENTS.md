# Agent Documentation: POS App

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

**WPay Mobile POS** is a React Native point-of-sale application that enables merchants to accept cryptocurrency payments via WalletConnect. The app allows merchants to:

- Generate QR codes for payment requests
- Accept payments through WalletConnect-compatible wallets
- Print thermal receipts for completed transactions
- Manage merchant settings and configurations
- Support multiple branded variants (white-labeling)

The app is built with **Expo** and **React Native**, supporting Android, iOS, and Web platforms.

## Tech Stack

### Core Technologies

- **React Native**: 0.81.5
- **Expo**: ^54.0.23 (with Expo Router for navigation)
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### Key Libraries

- **@tanstack/react-query**: Data fetching and caching
- **zustand**: State management (lightweight alternative to Redux)
- **react-hook-form**: Form handling
- **expo-router**: File-based routing
- **react-native-thermal-pos-printer**: Thermal printer integration
- **react-native-qrcode-skia**: QR code generation
- **@shopify/react-native-skia**: Graphics rendering
- **expo-secure-store**: Secure credential storage
- **react-native-mmkv**: Fast key-value storage
- **@sentry/react-native**: Error tracking and monitoring

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **patch-package**: Library patching for custom fixes

## Architecture

### Project Structure

```
pos-app/
├── app/                    # Expo Router screens (file-based routing)
│   ├── index.tsx          # Home screen
│   ├── amount.tsx         # Amount input screen
│   ├── scan.tsx           # QR code display & payment polling
│   ├── payment-success.tsx # Success screen with receipt printing
│   ├── payment-failure.tsx # Failure screen
│   ├── settings.tsx       # Settings & configuration
│   ├── activity.tsx       # Transaction history screen
│   └── logs.tsx           # Debug logs viewer
├── components/            # Reusable UI components
├── constants/            # Theme, variants, spacing, etc.
├── hooks/                # Custom React hooks
├── services/             # API client and payment services
├── store/                # Zustand state stores
├── utils/                # Utility functions
└── assets/               # Images, fonts, icons
```

### State Management

The app uses **Zustand** for state management with two main stores:

1. **`useSettingsStore`** (`store/useSettingsStore.ts`)
   - Merchant ID and API key
   - Theme mode (light/dark)
   - Selected variant
   - Device ID
   - Biometric authentication settings
   - Printer connection status
   - Transaction filter preference (for Activity screen)

2. **`useLogsStore`** (`store/useLogsStore.ts`)
   - Debug logs for troubleshooting
   - Log levels: info, warning, error

### Navigation

Uses **Expo Router** with file-based routing:

- Routes are defined by file structure in `app/` directory
- Navigation via `router.push()`, `router.replace()`, `router.dismiss()`
- Type-safe routing with TypeScript

## Key Features

### 1. Payment Flow

1. **Home Screen** (`app/index.tsx`)
   - "New sale" button to start payment
   - "Activity" button to view transaction history
   - "Settings" button for configuration
   - Validates merchant setup before allowing payments

2. **Amount Input** (`app/amount.tsx`)
   - Custom numeric keyboard component
   - Amount formatting (always 2 decimal places)
   - Form validation with react-hook-form

3. **QR Code Display** (`app/scan.tsx`)
   - Generates payment request via API
   - Displays QR code for wallet scanning
   - Polls payment status every 2 seconds
   - Handles payment success/failure navigation
   - Shows WalletConnect loading animation

4. **Payment Success** (`app/payment-success.tsx`)
   - Animated expanding circle background
   - Displays payment details
   - Option to print receipt
   - "New Payment" button to start over

5. **Payment Failure** (`app/payment-failure.tsx`)
   - Displays error information
   - Allows retry or return to home

6. **Activity Screen** (`app/activity.tsx`)
   - Transaction history list with pull-to-refresh
   - Filter tabs: All, Failed, Pending, Completed
   - Transaction detail modal on tap
   - Empty state when no transactions
   - Uses Merchant Portal API for data fetching

### 2. Receipt Printing

- **Thermal Printer Support** (`utils/printer.ts`)
  - Bluetooth/USB printer connection
  - Receipt generation with:
    - Variant-specific logo (base64 encoded)
    - Transaction ID, date, payment method
    - Amount in USD
    - Token symbol and amount (if applicable)
    - Network name
  - Automatic paper cutting after print
  - Error handling and logging

### 3. Settings & Configuration

- **Merchant Setup** (`app/settings.tsx`)
  - Merchant ID input
  - API key configuration (stored securely)
  - Device ID generation/management
  - Variant selection dropdown
  - Theme mode toggle (light/dark)
  - Biometric authentication toggle
  - Printer connection testing
  - Test receipt printing
  - App version display
  - Logs viewer access

### 4. Security Features

- **Secure Storage**: API keys stored in `expo-secure-store`
- **Biometric Authentication**: Face ID / Touch ID support
- **PIN Protection**: Optional PIN modal for sensitive actions
- **Secure Credentials**: Never logged or exposed

### 5. Theme System

- **Light/Dark Mode**: System-aware theme switching
- **Variant Support**: Multiple branded variants (see Variants System section)
- **Dynamic Colors**: Theme colors adapt based on variant selection
- **Accessibility**: Proper contrast ratios maintained

## Payment API Integration

### Payment API Client (`services/client.ts`)

- Base URL from `EXPO_PUBLIC_API_URL` environment variable
- Request/response interceptors
- Error handling

### Payment Service (`services/payment.ts`)

**`startPayment(request)`**

- Creates new payment request
- Requires merchant ID and API key
- Returns payment ID and QR code URI

**`getPaymentStatus(paymentId)`**

- Polls payment status
- Returns payment state (pending, completed, failed)
- Includes transaction details when completed

### Authentication Headers

All Payment API requests include:

- `Api-Key`: Merchant API key
- `Merchant-Id`: Merchant identifier
- `Sdk-Name`: "pos-device"
- `Sdk-Version`: "1.0.0"
- `Sdk-Platform`: "react-native"

## Merchant Portal API Integration

The Merchant Portal API is a separate backend used for fetching transaction history (Activity screen).

### Merchant API Client (`services/merchant-client.ts`)

- Base URL from `EXPO_PUBLIC_MERCHANT_API_URL` environment variable
- Uses different API key (`EXPO_PUBLIC_DEFAULT_MERCHANT_PORTAL_API_KEY`)
- Header: `x-api-key` for authentication

### Transactions Service (`services/transactions.ts`)

**`getTransactions(options)`**

- Fetches merchant transaction history
- Endpoint: `GET /merchants/{merchant_id}/payments`
- Supports filtering by status, date range, pagination
- Returns array of `PaymentRecord` objects

### useTransactions Hook (`services/hooks.ts`)

```typescript
import { useTransactions } from "@/services/hooks";

const { data, isLoading, isError, refetch } = useTransactions({
  filter: "all", // "all" | "completed" | "pending" | "failed"
  enabled: true,
});
```

- React Query hook with built-in caching (5 min stale time, 30 min cache)
- Automatic retry on failure (2 retries)
- Client-side filtering via `filter` option
- Logs errors to `useLogsStore` for debugging

## Environment Variables

Required environment variables (`.env`):

```bash
EXPO_PUBLIC_PROJECT_ID=""              # WalletConnect project ID
EXPO_PUBLIC_SENTRY_DSN=""              # Sentry error tracking DSN
SENTRY_AUTH_TOKEN=""                   # Sentry authentication token
EXPO_PUBLIC_API_URL=""                 # Payment API base URL
EXPO_PUBLIC_GATEWAY_URL=""             # WalletConnect gateway URL
EXPO_PUBLIC_DEFAULT_MERCHANT_ID=""     # Default merchant ID (optional)
EXPO_PUBLIC_DEFAULT_MERCHANT_API_KEY="" # Default merchant API key (optional)
EXPO_PUBLIC_MERCHANT_API_URL=""        # Merchant Portal API base URL
EXPO_PUBLIC_DEFAULT_MERCHANT_PORTAL_API_KEY="" # Merchant Portal API key (for Activity screen)
```

Copy `.env.example` to `.env` and fill in values.

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)
- Expo CLI

### Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Create native folders**

   ```bash
   npm run prebuild
   ```

4. **Start development server**
   ```bash
   npm run android    # Android
   npm run ios        # iOS
   npm run web        # Web
   ```

### Available Scripts

- `npm start`: Start Expo dev server
- `npm run android`: Run on Android
- `npm run ios`: Run on iOS
- `npm run web`: Run on web
- `npm run android:build`: Build Android release APK
- `npm run lint`: Run ESLint
- `npm test`: Run Jest tests

## Important Files & Directories

### Core Application Files

- **`app/_layout.tsx`**: Root layout with navigation setup
- **`app/index.tsx`**: Home screen entry point
- **`app/amount.tsx`**: Payment amount input
- **`app/scan.tsx`**: QR code display and payment polling
- **`app/payment-success.tsx`**: Success screen with animations
- **`app/payment-failure.tsx`**: Error handling screen
- **`app/settings.tsx`**: Settings and configuration

### Services & API

- **`services/client.ts`**: Payment API client configuration
- **`services/merchant-client.ts`**: Merchant Portal API client configuration
- **`services/payment.ts`**: Payment API functions
- **`services/transactions.ts`**: Transaction fetching service (Merchant Portal API)
- **`services/hooks.ts`**: React Query hooks for API calls (including `useTransactions`)
- **`api/payment.ts`**: Payment API types/interfaces
- **`api/payment-status.ts`**: Payment status types

### Utilities

- **`utils/printer.ts`**: Thermal printer integration
- **`utils/currency.ts`**: Currency formatting utilities
- **`utils/misc.ts`**: Date formatting and helpers
- **`utils/navigation.ts`**: Navigation helpers
- **`utils/secure-storage.ts`**: Secure storage wrapper
- **`utils/biometrics.ts`**: Biometric authentication helpers

### State Management

- **`store/useSettingsStore.ts`**: App settings and configuration
- **`store/useLogsStore.ts`**: Debug logging store

### Constants

- **`constants/theme.ts`**: Base theme color definitions
- **`constants/variants.ts`**: Variant configurations
- **`constants/printer-logos.ts`**: Base64-encoded printer logos
- **`constants/spacing.ts`**: Spacing scale constants

### Components

- **`components/qr-code.tsx`**: QR code display component
- **`components/numeric-keyboard.tsx`**: Custom numeric input
- **`components/pin-modal.tsx`**: PIN entry modal
- **`components/button.tsx`**: Themed button component
- **`components/themed-text.tsx`**: Theme-aware text component
- **`components/status-badge.tsx`**: Transaction status badge (Completed/Pending/Failed)
- **`components/transaction-card.tsx`**: Transaction list item
- **`components/filter-tabs.tsx`**: Filter tabs for Activity screen
- **`components/transaction-detail-modal.tsx`**: Transaction detail bottom sheet
- **`components/empty-state.tsx`**: Reusable empty state component

## Variants System

This POS app supports a **variants system** that allows for minor UI customizations while maintaining the same core functionality. Variants enable white-labeling and branding customization for different clients or use cases.

### Architecture

#### Core Components

1. **Theme System** (`constants/theme.ts`)
   - Defines base color palette for light and dark modes
   - Provides default colors used across the app
   - Colors can be overridden by variants

2. **Variants Configuration** (`constants/variants.ts`)
   - Defines available variants and their customizations
   - Each variant can override theme colors, logos, and default theme mode
   - Variants are selected via settings and stored in Zustand store

3. **Printer Logos** (`constants/printer-logos.ts`)
   - Contains base64-encoded logos for thermal printer receipts
   - Each variant has its own printer logo
   - Default logo uses `brand.png` converted to base64

### How Variants Work

#### Variant Structure

Each variant is defined with:

- **name**: Display name (e.g., "Solflare", "Binance")
- **brandLogo**: Image asset for UI branding (loaded via `require()`)
- **brandLogoWidth**: Optional width override for brand logo
- **printerLogo**: Base64-encoded string for receipt printing
- **defaultTheme**: Optional default theme mode ("light" or "dark")
- **colors**: Color overrides for light and dark themes

#### Color Override System

Variants can override any color from the base theme:

- Colors are merged with base theme colors
- Only specified colors are overridden; others use defaults
- Both light and dark theme overrides are supported

#### Example Variant

```typescript
solflare: {
  name: "Solflare",
  brandLogo: require("@/assets/images/variants/solflare_brand.png"),
  printerLogo: SOLFLARE_LOGO_BASE64,
  defaultTheme: "dark",
  colors: {
    light: {
      "icon-accent-primary": "#FFEF46",
      "bg-accent-primary": "#FFEF46",
      "bg-payment-success": "#FFEF46",
      "text-payment-success": "#202020",
      "border-payment-success": "#363636",
      "text-invert": "#202020",
    },
    dark: {
      // Similar overrides for dark theme
    },
  },
}
```

### Available Variants

1. **default**: Base variant with blue accent colors (#0988F0)
2. **solflare**: Yellow/gold branding (#FFEF46)
3. **binance**: Yellow branding (#FCD533)
4. **phantom**: Purple branding (#AB9FF2)
5. **solana**: Purple branding (#9945FF)

### Key Color Tokens

Commonly overridden colors in variants:

- `bg-accent-primary`: Primary accent background
- `bg-payment-success`: Payment success screen background
- `icon-accent-primary`: Accent icon color
- `text-payment-success`: Text color on success screen
- `border-payment-success`: Border color for success elements
- `text-invert`: Inverted text (for dark backgrounds)

### Usage in Components

#### Accessing Theme Colors

```typescript
import { useTheme } from "@/hooks/use-theme-color";

const Theme = useTheme();
// Theme["bg-payment-success"] will use variant override if set
```

#### Variant Selection

Variants are stored in Zustand store (`store/useSettingsStore.ts`):

- Selected variant persists across app sessions
- Can be changed in Settings screen
- Affects all themed components immediately

### Creating New Variants

#### Steps

1. **Add variant logo image**
   - Place in `assets/images/variants/<variant-name>_brand.png`
   - PNG format recommended

2. **Convert logo to base64 for printer**
   - Use online tool or command: `base64 -i assets/images/variants/<variant-name>_brand.png`
   - Add to `constants/printer-logos.ts` as `export const <VARIANT>_LOGO_BASE64`

3. **Define variant in `constants/variants.ts`**
   - Add variant name to `VariantName` type
   - Import printer logo base64
   - Add variant configuration to `Variants` object
   - Specify color overrides for light/dark themes

4. **Update version code** (if needed)
   - Increment `expo.android.versionCode` in `app.json`

#### Example: Adding a New Variant

```typescript
// 1. In printer-logos.ts
export const MYVARIANT_LOGO_BASE64 = "data:image/png;base64,...";

// 2. In variants.ts
import { MYVARIANT_LOGO_BASE64 } from "./printer-logos";

export type VariantName =
  | "default"
  | "solflare"
  | "binance"
  | "phantom"
  | "solana"
  | "myvariant"; // Add here

export const Variants: Record<VariantName, Variant> = {
  // ... existing variants
  myvariant: {
    name: "My Variant",
    brandLogo: require("@/assets/images/variants/myvariant_brand.png"),
    printerLogo: MYVARIANT_LOGO_BASE64,
    defaultTheme: "light",
    colors: {
      light: {
        "bg-accent-primary": "#CUSTOM_COLOR",
        "bg-payment-success": "#CUSTOM_COLOR",
        // ... other overrides
      },
      dark: {
        // ... dark theme overrides
      },
    },
  },
};
```

### Important Notes

1. **Color Contrast**: When overriding colors, ensure sufficient contrast for accessibility
   - Light backgrounds need dark text
   - Dark backgrounds need light text
   - Some variants use `text-invert` override for better contrast

2. **Printer Logos**: Must be base64-encoded PNG strings
   - Format: `"data:image/png;base64,<base64-string>"`
   - Used in thermal printer receipts
   - Logo size is automatically handled by printer library

3. **Default Theme**: Variants can specify a default theme mode
   - Users can still switch themes manually
   - Default applies on first launch

4. **Payment Success Color**: The `bg-payment-success` color is used for:
   - Payment success screen background (expanding circle animation)
   - Success screen buttons
   - Success screen text (via `text-payment-success`)

5. **Variant Persistence**: Selected variant is stored in Zustand store
   - Persists across app restarts
   - Can be changed in Settings screen

### Testing Variants

1. Open Settings screen
2. Select different variants from dropdown
3. Verify:
   - Brand logo changes in header
   - Accent colors update throughout app
   - Payment success screen uses variant colors
   - Receipt printing uses variant logo

### Related Files

- `constants/theme.ts`: Base theme colors
- `constants/variants.ts`: Variant definitions
- `constants/printer-logos.ts`: Printer logo base64 strings
- `store/useSettingsStore.ts`: Variant selection state
- `app/settings.tsx`: Variant selection UI
- `hooks/use-theme-color.ts`: Theme color hook with variant support

## Production Builds

### Android Release

1. **Required Files** (get from mobile team or 1Password):
   - `android/secrets.properties`
   - `android/app/wc_rn_upload.keystore`

2. **Build Release APK**:

   ```bash
   npm run android:build
   ```

   Output: `android/app/build/outputs/apk/release/app-release.apk`

3. **Install via USB**:
   ```bash
   adb devices  # Get device ID
   adb -s <DEVICE_ID> install android/app/build/outputs/apk/release/app-release.apk
   ```

### Version Management

**⚠️ Important: For every new feature or change, you MUST update the Android version code in `app.json`.**

- **Increment version code**: Update `expo.android.versionCode` in `app.json` for each change
- **Current version code**: Check the current value in `app.json` and increment by 1
- **Why**: Android requires a unique version code for each release. Without incrementing, new builds cannot be installed over previous versions
- **Example**: If current version code is `15`, change it to `16` for your changes
- Current version code: 16

## Key Dependencies & Their Purposes

- **@tanstack/react-query**: Manages API calls, caching, and polling for payment status
- **zustand**: Lightweight state management for settings and logs
- **expo-router**: File-based routing system
- **react-native-thermal-pos-printer**: Bluetooth/USB thermal printer integration
- **react-native-qrcode-skia**: QR code generation for payment requests
- **expo-secure-store**: Secure storage for API keys and sensitive data
- **react-native-mmkv**: Fast key-value storage for non-sensitive data
- **expo-local-authentication**: Biometric authentication (Face ID/Touch ID)
- **@sentry/react-native**: Error tracking and crash reporting
- **react-hook-form**: Form handling and validation
- **react-native-reanimated**: Animations (used in payment success screen)

## Common Patterns

### Theme Usage

```typescript
import { useTheme } from "@/hooks/use-theme-color";

const Theme = useTheme();
// Access colors: Theme["bg-accent-primary"]
```

### Navigation

```typescript
import { router } from "expo-router";

// Navigate to screen
router.push("/amount");

// Navigate with params
router.push({
  pathname: "/scan",
  params: { amount: "10.00" },
});

// Replace current screen
router.replace("/payment-success");

// Dismiss modal
router.dismiss();
```

### API Calls

```typescript
import { usePaymentStatus } from "@/services/hooks";

const { data, isLoading, error } = usePaymentStatus(paymentId, {
  enabled: !!paymentId,
  refetchInterval: 2000, // Poll every 2 seconds
});
```

### Secure Storage

```typescript
import { secureStorage, SECURE_STORAGE_KEYS } from "@/utils/secure-storage";

// Store
await secureStorage.setItem(SECURE_STORAGE_KEYS.MERCHANT_API_KEY, apiKey);

// Retrieve
const apiKey = await secureStorage.getItem(
  SECURE_STORAGE_KEYS.MERCHANT_API_KEY,
);
```

## Code Quality Guidelines

### Debugging and Logging

**⚠️ Important: Do NOT leave `console.log()` statements in production code.**

- **Use the logging system**: For debugging, use the app's built-in logging system via `useLogsStore`:

  ```typescript
  import { useLogsStore } from "@/store/useLogsStore";

  const addLog = useLogsStore((state) => state.addLog);
  addLog("info", "Payment completed", "payment-success", "handlePrintReceipt");
  ```

- **Remove console.logs before committing**: Always remove any `console.log()`, `console.error()`, or other console statements before committing code.

- **View logs in app**: Users can view logs in the Settings screen → View Logs

- **Production builds**: Console statements can impact performance and expose sensitive information in production builds.

### After Making Changes

**Always run these checks and fix any errors before committing:**

```bash
npm run lint          # Check and fix ESLint errors
npx prettier --write . # Format code with Prettier
npx tsc --noEmit      # Check for TypeScript errors
```

Fix any errors found. Pre-existing TypeScript errors in unrelated files can be ignored.

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for consistent formatting
- Prefer functional components with hooks
- Use TypeScript types/interfaces for all props and data structures
- No trailing whitespace

## Troubleshooting

### Printer Issues

- Check Bluetooth permissions in Android settings
- Verify printer is paired and connected
- Check logs in Settings → View Logs
- Test connection via Settings → Test Printer Connection

### Payment Issues

- Verify merchant ID and API key in Settings
- Check network connectivity
- Review logs for API errors
- Ensure `EXPO_PUBLIC_API_URL` is correctly configured

### Build Issues

- Run `npm run prebuild` after dependency changes
- Clear Metro cache: `npx expo start --clear`
- Clean Android build: `cd android && ./gradlew clean`

## Additional Resources

- **README.md**: Setup and development instructions
- **app.json**: Expo configuration
- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript configuration
