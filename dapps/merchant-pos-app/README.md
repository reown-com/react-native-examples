# Merchant POS

A standalone Expo React Native app where a merchant onboards themselves, connects their own
settlement wallet (EVM + Solana) via **Reown AppKit**, and runs crypto POS payments and shareable
payment links through the **WalletConnect Pay (WCPay)** API.

In V1 the **connected wallet is the merchant identity** — onboarding is lightweight and stored
locally on the device.

## Screens

| Flow | Screen | Route |
| --- | --- | --- |
| Welcome | Value prop, Get started / Log in | `app/index.tsx` |
| Onboarding | Business details (email, company, logo) | `app/onboarding/business-details.tsx` |
| | Settlement networks (Ethereum / Solana) | `app/onboarding/networks.tsx` |
| | Connect wallet (AppKit, "already registered" guard) | `app/onboarding/connect-wallet.tsx` |
| | Verify ownership (sign message) | `app/onboarding/verify.tsx` |
| | Choose tokens | `app/onboarding/tokens.tsx` |
| Home | Merchant card, stats, actions, recent activity | `app/home.tsx` |
| POS | Amount entry (numpad + currency) | `app/pos/amount.tsx` |
| | Checkout: QR + polling + 15-min expiry + cancel | `app/pos/checkout.tsx` |
| | Payment received / cancelled-expired-failed | `app/pos/success.tsx`, `app/pos/cancelled.tsx` |
| Links | List, create, native share (10-day validity) | `app/links/index.tsx` |
| Activity | Locally tracked payment history | `app/activity.tsx` |

## Architecture

- **Navigation:** Expo Router (file-based, `headerShown: false` with custom in-screen headers).
- **Wallet:** Reown AppKit (`@reown/appkit-react-native` + wagmi & Solana adapters) initialized in
  `app/_layout.tsx`. AppKit sessions persist via an AsyncStorage adapter (`utils/appkit-storage.ts`).
- **State:** Zustand stores persisted to MMKV (`utils/storage.ts`):
  - `useMerchantStore` — registry of onboarded wallets keyed by address + the active session.
  - `useOnboardingStore` — in-memory draft committed on "Finish setup".
  - `useSettingsStore` — theme + currency.
  - `usePaymentsStore` / `usePaymentLinksStore` — locally tracked payments and links.
- **Payments:** WCPay REST via `services/` (`startPayment` / `getPaymentStatus` / `cancelPayment`),
  with React Query polling in `services/hooks.ts`.
- **Theme:** light + dark token system (`constants/theme.ts`, `hooks/use-theme-color.ts`); defaults
  to dark, matching the prototype.

### Identity ↔ payments reconciliation (V1)

The merchant identity is **local** (wallet = merchant; registry in MMKV, signature verified
client-side). The WCPay API, however, authenticates with a server-side `Merchant-Id` + `Api-Key`
and is **fiat-denominated** (`startPayment({ referenceId, amount: { value, unit } })` →
`{ paymentId, expiresAt, gatewayUrl }`) with no per-request recipient wallet or token/network.

Until a wallet-based merchant onboarding API exists, the two are bridged by env credentials
(`utils/merchant-config.ts`): the locally-onboarded wallet/networks/tokens are the merchant's
displayed settlement profile, while the live payment rail uses the configured WCPay merchant. The
returned `gatewayUrl` is what the customer scans/opens; status is polled for real. Onboarding works
without any API credentials — only the POS/links payment leg needs them.

> AppKit's network set is fixed at `createAppKit` time, so the Screen-3 network selection is stored
> as a settlement preference and rendered as scope rather than re-scoping AppKit at runtime.

## Setup

```bash
npm install
cp .env.example .env   # fill in values
```

`.env`:

```bash
EXPO_PUBLIC_PROJECT_ID=""              # Reown AppKit project id — https://dashboard.reown.com
EXPO_PUBLIC_API_URL=""                 # WCPay API base URL
EXPO_PUBLIC_DEFAULT_MERCHANT_ID=""     # WCPay merchant id (payment rail)
EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY="" # WCPay api key (payment rail)
```

## Run

AppKit and several libraries ship native modules, so a development build is required:

```bash
npx expo prebuild      # generate ios/ and android/
npm run ios            # or: npm run android
```

## Checks

```bash
npx tsc --noEmit
npm run lint
npx prettier --write .
```
