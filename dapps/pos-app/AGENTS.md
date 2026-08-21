# Agent Documentation: POS App

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

**WPay Mobile POS** is a React Native point-of-sale application that enables merchants to accept cryptocurrency payments via WalletConnect. Merchants generate QR codes for payment requests, accept payments from WalletConnect-compatible wallets, print thermal receipts, and manage settings.

Built with **Expo** and **React Native**, supporting Android, iOS, and Web. Check `package.json` for exact versions and dependencies.

## Project Structure

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
├── api/                   # Vercel serverless proxies (web only)
├── components/            # Reusable UI components
├── constants/             # Theme, spacing, printer logos, etc.
├── hooks/                 # Custom React hooks
├── services/              # API client and payment services
├── store/                 # Zustand state stores (useSettingsStore, useLogsStore)
├── utils/                 # Utility functions (printer, currency, secure storage)
└── assets/                # Images, fonts, icons
```

## Payment API Integration

### Platform-Specific Service Files

> **Important:** The payment service has two implementations:
>
> - **`services/payment.ts`** — Native (iOS/Android): uses `apiClient` from `services/client.ts` to call the merchant API directly.
> - **`services/payment.web.ts`** — Web: uses Vercel serverless proxies (`/api/*`) to avoid CORS issues. Each API function calls a corresponding proxy in the `api/` directory.
>
> **When adding new API functions, you must add them to BOTH files** and create a corresponding Vercel serverless proxy in `api/`. The same pattern applies to `services/transactions.ts` / `services/transactions.web.ts`.

Vercel proxies share `extractCredentials()` and `getApiHeaders()` from `api/_utils.ts`. React Query hooks for these services live in `services/hooks.ts`.

### Authentication Headers

All Payment API requests include:

- `Api-Key`: Merchant API key
- `Merchant-Id`: Merchant identifier
- `WCP-Version`: API version for backward compatibility (e.g., `"2026-02-19.preview"`)
- `Sdk-Name`: "pos-device"
- `Sdk-Version`: "1.0.0"
- `Sdk-Platform`: "react-native" (native) or "web" (Vercel proxies)

## Environment Variables

Required in `.env`:

```bash
EXPO_PUBLIC_API_URL=""                 # Payment API base URL
```

Optional:

```bash
EXPO_PUBLIC_SENTRY_DSN=""              # Sentry error tracking DSN
SENTRY_AUTH_TOKEN=""                   # Sentry authentication token for release builds
EXPO_PUBLIC_DEFAULT_MERCHANT_ID=""     # Default merchant ID (optional)
EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY="" # Default customer API key (optional)
```

Copy `.env.example` to `.env` and fill in the values you need. Never commit `.env` files or credentials.

## Development Setup

This project uses **npm** (not pnpm or yarn). Always use `npm` commands.

```bash
npm install          # Install dependencies
cp .env.example .env # Set up environment variables
npm run prebuild     # Create native folders
```

### Available Scripts

- `npm start`: Start Expo dev server
- `npm run android` / `npm run ios` / `npm run web`: Run on each platform
- `npm run android:build`: Build Android release APK
- `npm run android:build:aab`: Build Android App Bundle (AAB) for release
- `npm run lint`: Run ESLint
- `npm test`: Run Jest tests

## Theming

- Theme colors are defined in `constants/theme.ts` and accessed via `useTheme()` from `hooks/use-theme-color.ts` (e.g. `Theme["bg-accent-primary"]`).
- Light/dark mode is toggled in Settings and persisted in `store/useSettingsStore.ts`.
- Thermal printer receipt logos are base64-encoded strings in `constants/printer-logos.ts` — this is a hardware constraint of the printer library, not an optimization choice.

Only the `default` variant ships today; branded variant colors and the Settings selector are disabled. To re-enable variants, follow the inline checklist in `constants/variants.ts` and `hooks/use-theme-color.ts`, including restoring the Settings UI.

## Desktop Web Frame

On desktop web browsers the app renders inside a simulated POS device frame (`components/desktop-frame-wrapper.web.tsx`, applied in `index.web.tsx`). Detection uses the `useIsDesktopWeb` hook; on mobile web and native, children render unchanged. Frame dimensions live in `constants/desktop-frame.ts`.

React Native's `<Modal>` renders at the viewport level, escaping the device frame. Use `<FramedModal>` instead for modals that should appear inside the frame:

- **Native** (`components/framed-modal.tsx`): plain React Native `<Modal>`
- **Web** (`components/framed-modal.web.tsx`): renders via `createPortal` into the frame container (provided by `components/modal-portal-context.tsx`); handles Escape to close; falls back to in-place absolute positioning when no portal container exists (mobile web)

`FramedModal` only provides the container — children must include their own overlay and content styling.

## Production Builds

### Android Release

1. **Required files** (get from mobile team or 1Password):
   - `android/secrets.properties`
   - `android/app/wc_rn_upload.keystore`

2. **Build**:

   ```bash
   npm run android:build      # APK → android/app/build/outputs/apk/release/app-release.apk
   npm run android:build:aab  # AAB → android/app/build/outputs/bundle/release/app-release.aab
   ```

3. **Install via USB**:

   ```bash
   adb devices  # Get device ID
   adb -s <DEVICE_ID> install android/app/build/outputs/apk/release/app-release.apk
   ```

### Version Management

**⚠️ Important: For every new feature or change, you MUST increment `expo.android.versionCode` in `app.json`.** Android requires a unique version code for each release; without incrementing, new builds cannot be installed over previous versions.

## Code Quality Guidelines

### Debugging and Logging

Do not leave ad-hoc console statements in React Native application code. Use the app's built-in logging system instead:

```typescript
import { useLogsStore } from "@/store/useLogsStore";

const addLog = useLogsStore((state) => state.addLog);
addLog("info", "Payment completed", "payment-success", "handlePrintReceipt");
```

Logs are viewable in-app via Settings → View Logs. Console logging is acceptable in server-side Vercel functions, build/setup scripts, and low-level error fallbacks where the in-app store is unavailable. Never log credentials or other sensitive values.

### After Making Changes

Run these checks before committing:

```bash
npm run lint          # Check ESLint errors
npm run format:check  # Check formatting without changing unrelated files
npx tsc --noEmit      # Check TypeScript errors
npm test              # Run Jest tests
```

Fix failures introduced by your change. If a check has unrelated pre-existing failures, report them clearly. Format only files you changed, for example with `npx prettier --write <files...>`.

**When moving exports between modules**, update any `jest.mock()` calls in tests that mock the source or destination module. Mocks that use a manual factory (e.g., `jest.mock("@/services/client", () => ({ ... }))`) replace the entire module — any export not included in the factory becomes `undefined` at runtime, which silently breaks tests.

### Code Style

- Prefer functional components with hooks
- Use TypeScript types/interfaces for all props and data structures
- Use ESLint and Prettier for consistent formatting
