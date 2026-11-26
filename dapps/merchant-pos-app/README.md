# Merchant POS

A standalone Expo React Native app where a merchant onboards themselves, connects their own
settlement wallet (EVM + Solana) via **Reown AppKit**, and runs crypto POS payments and shareable
payment links through the **WalletConnect Pay (WCPay)** API.

In V1 the **connected wallet is the merchant identity** — onboarding is lightweight and stored
locally on the device.

## Screens

| Flow       | Screen                                              | Route                                          |
| ---------- | --------------------------------------------------- | ---------------------------------------------- |
| Welcome    | Value prop, Get started / Log in                    | `app/index.tsx`                                |
| Onboarding | Business details (email, company, logo)             | `app/onboarding/business-details.tsx`          |
|            | Settlement networks (Ethereum / Solana)             | `app/onboarding/networks.tsx`                  |
|            | Connect wallet (AppKit, "already registered" guard) | `app/onboarding/connect-wallet.tsx`            |
|            | Verify ownership (sign message)                     | `app/onboarding/verify.tsx`                    |
|            | Choose tokens                                       | `app/onboarding/tokens.tsx`                    |
| Home       | Merchant card, stats, actions, recent activity      | `app/home.tsx`                                 |
| POS        | Amount entry (numpad + currency)                    | `app/pos/amount.tsx`                           |
|            | Checkout: QR + polling + 15-min expiry + cancel     | `app/pos/checkout.tsx`                         |
|            | Payment received / cancelled-expired-failed         | `app/pos/success.tsx`, `app/pos/cancelled.tsx` |
| Links      | List, create, native share (10-day validity)        | `app/links/index.tsx`                          |
| Activity   | Locally tracked payment history                     | `app/activity.tsx`                             |

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

### Identity ↔ payments

A persistent **install id** (`utils/install-id.ts`, MMKV — survives launches, wiped on uninstall)
is the merchant id. On onboarding finish the app calls **PUT
`{EXPO_PUBLIC_PAY_CORE_API_URL}/v2/internal/merchant`** with a Cognito access token (minted via
client_credentials, cached for 50 min — see `services/cognito-auth.ts`), passing the install id,
business name, settlement networks (CAIP-10 MTAs + CAIP-19 tokens), and `partnerId`. The local
`MerchantConfig` records the `merchantId` and `version`; re-onboarding bumps the version.

WCPay payment calls (`startPayment` / status / cancel) then go to the customer API with
`Merchant-Id` = the active merchant's id (the one we just created), `Api-Key` = the partner-scoped
key from env. The returned `gatewayUrl` is what the customer scans/opens.

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
EXPO_PUBLIC_API_URL=""                 # WCPay API base URL (include /v1)
EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY="" # WCPay api key (partner-scoped)

# Merchant-Id is no longer env-sourced. It's the install-bound id of the
# merchant we created at onboarding finish via the pay-core upsert.

# Pay-core internal API (used to upsert the merchant on onboarding finish).
# Mirrors dashboard-new/src/server/clients/pay-core (PUT /v2/internal/merchant).
EXPO_PUBLIC_PAY_CORE_API_URL=""
EXPO_PUBLIC_PAY_PARTNER_ID=""

# Pay-core Cognito (OAuth2 client_credentials). The app mints an access token
# via these creds and caches it for 50 min, refreshing on 401.
EXPO_PUBLIC_PAY_CORE_COGNITO_TOKEN_ENDPOINT=""
EXPO_PUBLIC_PAY_CORE_COGNITO_CLIENT_ID=""
EXPO_PUBLIC_PAY_CORE_COGNITO_CLIENT_SECRET=""
EXPO_PUBLIC_PAY_CORE_COGNITO_SCOPE=""
```

## Merchant identity & upsert

A persistent install id (`utils/install-id.ts`, stored in MMKV — survives app
launches, wiped on uninstall) is minted on first launch and used as the
**merchant id**. When the user completes onboarding (Finish setup on the tokens
screen), the app builds a `MerchantUpsertRequest` from the draft + connected
addresses (per-namespace CAIP-10 MTAs + CAIP-19 tokens for the selected
networks) and PUTs it to `EXPO_PUBLIC_PAY_CORE_API_URL/v2/internal/merchant`
with the bearer token. The local merchant config records the `merchantId` and
`version`; re-onboarding bumps the version.

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
