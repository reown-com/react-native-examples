# Agent Documentation: PoC POS App

This file provides guidance to AI agents when working with code in this repository.

> **Note:** This is a legacy proof-of-concept application. For active development, see `dapps/pos-app`.

## Project Overview

**PoC POS App** is a proof-of-concept React Native point-of-sale application for cryptocurrency payments via WalletConnect. It serves as the foundation for the production `pos-app`. The app allows merchants to:

- Generate QR codes for payment requests
- Accept payments through WalletConnect-compatible wallets
- Print thermal receipts for completed transactions
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
- **zustand**: State management
- **react-hook-form**: Form handling
- **expo-router**: File-based routing
- **react-native-thermal-pos-printer**: Thermal printer integration
- **react-native-qrcode-skia**: QR code generation
- **@shopify/react-native-skia**: Graphics rendering
- **react-native-mmkv**: Fast key-value storage
- **@sentry/react-native**: Error tracking

## Architecture

### Project Structure

```
poc-pos-app/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Home screen
│   ├── amount.tsx         # Amount input screen
│   ├── scan.tsx           # QR code display & payment polling
│   ├── payment-success.tsx # Success screen
│   ├── payment-failure.tsx # Failure screen
│   ├── settings.tsx       # Settings & configuration
│   └── logs.tsx           # Debug logs viewer
├── components/            # Reusable UI components
├── constants/             # Theme, variants, spacing
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state stores
├── utils/                 # Utility functions
└── assets/                # Images, fonts, icons
```

### State Management

Uses **Zustand** with two main stores:

1. **`useSettingsStore`** (`store/useSettingsStore.ts`)
   - Merchant ID, theme mode, variant selection
   - Device ID, PIN protection settings
   - Printer connection status

2. **`useLogsStore`** (`store/useLogsStore.ts`)
   - Debug logs for troubleshooting

### Navigation

Uses **Expo Router** with file-based routing:
- Routes defined by file structure in `app/` directory
- Navigation via `router.push()`, `router.replace()`, `router.dismiss()`

## Key Features

### Payment Flow
1. Home Screen → New Sale button
2. Amount Input → Custom numeric keyboard
3. QR Code Display → Polls payment status
4. Payment Success/Failure → Receipt printing option

### Variants System
Supports branded variants for white-labeling:
- **default**: Blue accent (#0988F0)
- **solflare**: Yellow/gold (#FFEF46)
- **binance**: Yellow (#FCD533)
- **phantom**: Purple (#AB9FF2)
- **solana**: Purple (#9945FF)

### Security
- PIN protection with lockout after failed attempts
- Biometric authentication support
- MMKV encrypted storage

## Environment Variables

Required in `.env`:
```bash
EXPO_PUBLIC_PROJECT_ID=""      # WalletConnect project ID
EXPO_PUBLIC_SENTRY_DSN=""      # Sentry error tracking DSN
SENTRY_AUTH_TOKEN=""           # Sentry authentication token
EXPO_PUBLIC_API_URL=""         # Payment API base URL
EXPO_PUBLIC_GATEWAY_URL=""     # WalletConnect gateway URL
EXPO_PUBLIC_MERCHANTS_URL=""   # Merchants API URL
```

## Development

### Setup
```bash
npm install
cp .env.example .env
npm run prebuild
npm run android    # or ios/web
```

### Scripts
- `npm start`: Start Expo dev server
- `npm run android`: Run on Android
- `npm run ios`: Run on iOS
- `npm run web`: Run on web
- `npm run lint`: Run ESLint
- `npm test`: Run Jest tests

## Code Quality Guidelines

### Logging
- Use `useLogsStore` for debugging, not `console.log()`
- Remove console statements before committing

### After Making Changes

**Always run these checks and fix any errors before committing:**

```bash
npm run lint          # Check and fix ESLint errors
npx prettier --write . # Format code with Prettier
npx tsc --noEmit      # Check for TypeScript errors
```

### Style
- No trailing whitespace
- Use TypeScript strict mode
- Follow existing code patterns
