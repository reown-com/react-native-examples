# Agent Documentation: RN CLI Wallet

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

**RN CLI Wallet** (React Native CLI Wallet) is a comprehensive wallet application demonstrating integration with **WalletConnect WalletKit SDK**. It showcases how to build a multi-chain wallet supporting:

- **EIP155** (Ethereum & 17 EVM-compatible chains)
- **Sui** blockchain
- **TON** blockchain
- **Tron** blockchain

This is a production-ready reference implementation for developers building wallet applications with WalletConnect.

## Tech Stack

### Core Technologies
- **React Native**: 0.82.0
- **React**: 19.1.1
- **TypeScript**: ^5.8.3

### WalletConnect SDKs
- **@reown/walletkit**: Main WalletConnect wallet SDK
- **@walletconnect/react-native-compat**: React Native compatibility layer
- **@walletconnect/pay**: WalletConnect Pay integration

### Blockchain Libraries
- **ethers** (6.13.5): Ethereum/EVM interactions
- **@mysten/sui**: Sui blockchain support
- **@ton/core**, **@ton/crypto**, **@ton/ton**: TON blockchain
- **tronweb**: Tron blockchain

### Key Libraries
- **@react-navigation**: Navigation (stack, bottom-tabs)
- **valtio**: Reactive state management (proxy-based)
- **react-native-mmkv**: Fast key-value storage
- **react-native-quick-crypto**: Cryptographic operations
- **bip39**: Mnemonic seed phrase generation
- **react-native-vision-camera**: QR code scanning
- **@sentry/react-native**: Error tracking

## Architecture

### Project Structure

```
rn_cli_wallet/
├── src/
│   ├── screens/
│   │   ├── App.tsx              # Root component with initialization
│   │   ├── Connections/         # Active wallet connections
│   │   ├── Scan/                # QR code scanning
│   │   ├── SessionDetail/       # Session management
│   │   ├── Settings/            # Wallet & chain settings
│   │   └── LogList/             # Event logging
│   ├── modals/
│   │   ├── requestConfig.ts          # RPC-method → config map
│   │   ├── SessionRequestModal.tsx   # Generic config-driven request modal
│   │   ├── SessionProposalModal.tsx
│   │   ├── SessionAuthenticateModal.tsx
│   │   ├── SessionTonSignDataModal.tsx    # bespoke (custom UI/lifecycle)
│   │   ├── SessionTonSendMessageModal.tsx # bespoke (custom UI/lifecycle)
│   │   ├── ImportWalletModal.tsx
│   │   ├── PaymentOptionsModal/  # WalletConnect Pay
│   │   └── RequestModal.tsx      # Shared header/footer wrapper
│   ├── navigators/
│   │   ├── RootStackNavigator.tsx
│   │   ├── HomeTabNavigator.tsx
│   │   ├── ConnectionsStack.tsx
│   │   └── SettingsStack.tsx
│   ├── components/
│   │   ├── Modal/
│   │   ├── Button.tsx           # Primary pressable (use instead of TouchableOpacity)
│   │   ├── ActionButton.tsx
│   │   ├── Card.tsx
│   │   ├── ConnectButton.tsx
│   │   ├── VerifyInfoBox.tsx    # EIP-4361 verification
│   │   └── Text.tsx
│   ├── store/
│   │   ├── SettingsStore.ts     # App state (addresses, sessions)
│   │   ├── ModalStore.ts        # Modal state
│   │   └── PaymentStore.ts      # Payment state
│   ├── lib/                     # Chain-specific wallet implementations
│   │   ├── EIP155Lib.ts         # Ethereum wallet (ethers.js)
│   │   ├── SuiLib.ts            # Sui wallet
│   │   ├── TonLib.ts            # TON wallet
│   │   └── TronLib.ts           # Tron wallet
│   ├── utils/
│   │   ├── WalletKitUtil.ts     # WalletKit initialization
│   │   ├── EIP155RequestHandlerUtil.ts
│   │   ├── SuiRequestHandlerUtil.ts
│   │   ├── TonRequestHandlerUtil.ts
│   │   ├── TronRequestHandlerUtil.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useInitializeWalletKit.ts
│   │   ├── useInitializePaySDK.ts
│   │   ├── useWalletKitEventsManager.ts
│   │   └── ...
│   ├── constants/               # Chain definitions
│   │   ├── Eip155.ts            # 17 EVM chains
│   │   ├── Sui.ts
│   │   ├── Ton.ts
│   │   └── Tron.ts
│   └── assets/
├── android/
├── ios/
├── scripts/
└── package.json
```

### State Management

Uses **Valtio** (proxy-based reactive state):

- **SettingsStore**: Wallet addresses, sessions, chain settings, device ID
- **ModalStore**: Modal visibility and request data
- **PaymentStore**: WalletConnect Pay state

### Navigation

**React Navigation** with:
- Bottom tabs: Connections, Scan, Settings, Logs
- Stack navigators for each tab section
- Modal screens for signing requests

## Key Features

### Multi-Chain Support

**EIP155 (17 chains)**
- Ethereum, Polygon, Arbitrum, Optimism, Base
- Avalanche, BSC, Fantom, zkSync, Gnosis
- Moonbeam, Celo, Aurora, Zora, and more

**Other Chains**
- Sui (mainnet, testnet, devnet)
- TON (mainnet, testnet)
- Tron

### Wallet Functionality
- Import wallet via mnemonic or private key
- HD key derivation for multiple accounts
- Transaction signing for all supported chains
- Message signing (personal_sign, eth_signTypedData, etc.)
- Chain switching and dynamic updates

### WalletConnect Integration
- Session management and pairing via QR code
- Multi-chain session support
- Deep linking (WalletConnect URI parsing)
- WalletConnect Pay SDK
- EIP-4361 (Sign-In with Ethereum) verification

### Request Handling Modals

Most approve/reject signing requests are rendered by **one generic modal**,
`modals/SessionRequestModal.tsx`, driven by a config map in
`modals/requestConfig.ts` keyed by RPC method. All EIP155, Solana, Sui,
Bitcoin (BIP122), Tron and Canton signing methods go through it — there is no
per-method modal file for them.

`hooks/useWalletKitEventsManager.ts` dispatches by looking the method up in
the config first (`getRequestConfig(method)`); if found it opens
`SessionRequestModal`. The `switch` that follows only handles requests that
need bespoke behavior.

Modals that are intentionally NOT config-driven (they have custom UI and/or
lifecycle, so they keep dedicated components):
- `SessionProposalModal`: connection approval (namespace/account selection)
- `SessionAuthenticateModal`: SIWE / one-click auth
- `SessionTonSignDataModal` / `SessionTonSendMessageModal`: TON (on-mount
  `validateTonRequest` auto-reject, "Signing address" card, two-arg
  `approveTonRequest(event, session)`, custom payload formatting)

#### Adding a new request type / method

For a signing method whose modal is just header + `AppInfoCard` +
`NetworkInfoCard` + payload + approve/reject (i.e. the common case), do NOT
create a new modal file. Instead:

1. Add the method constant to the chain's `constants/<Chain>.ts`.
2. Add a `case` to the chain's `utils/<Chain>RequestHandlerUtil.ts` so
   `approve<Chain>Request` knows how to sign/execute it.
3. Add one entry to `REQUEST_CONFIG` in `modals/requestConfig.ts`, keyed by
   the method string:
   ```ts
   [MY_CHAIN_METHODS.MY_METHOD]: {
     approve: approveMyChainRequest,
     reject: rejectMyChainRequest,
     intention: 'Sign a message for',        // header text (string or fn)
     approveLabel: 'Sign',                     // primary button label
     renderPayload: req => getSignParamsMessage(req.params), // sync payload
     approveErrorTitle: 'Couldn’t sign message',
     rejectRedirectError: 'User rejected signature request', // optional
     logScope: 'SessionRequestModal:my_method',
   },
   ```

That's it — no `ModalStore` view union edit, no `Modal.tsx` case, no
event-manager `case`. For a brand-new chain, also add its
`utils/<Chain>WalletUtil.ts` + `utils/<Chain>RequestHandlerUtil.ts` and register
its namespace/accounts (see `SessionProposalModal` + `HelperUtil`).

Config knobs for the less-common cases:
- `resolvePayload(req): Promise<string>` — async payload (e.g. Sui decodes a
  BCS transaction via the wallet); takes precedence over `renderPayload`.
- `respondErrorOnApproveFailure: true` — on approve failure, also send the
  reject response so the dapp doesn't hang (Canton relies on this).

If a request needs custom UI or modal-lifecycle behavior (an extra section, a
validation-on-mount step, a multi-arg handler), it does NOT belong in the
config — give it a dedicated modal like the TON ones and add a `case` in the
event manager + `Modal.tsx` + the `ModalStore` view union.

## Environment Variables

Required in `.env`. The app uses Expo's `EXPO_PUBLIC_*` convention (auto-loaded
by the Expo CLI and inlined into the JS bundle at build time — these are public,
not secrets). Accessed via `import { ENV } from '@/utils/env'`.
```bash
EXPO_PUBLIC_PROJECT_ID=""        # WalletConnect Project ID (required)
EXPO_PUBLIC_SENTRY_DSN=""        # Sentry error tracking (optional)
EXPO_PUBLIC_TON_CENTER_API_KEY="" # TON blockchain API key (optional)
EXPO_PUBLIC_BLOCKCHAIN_API_URL="" # Blockchain API URL (to get wallet balances)
EXPO_PUBLIC_TEST_PRIVATE_KEY=""  # Private key for funded test wallet (Maestro E2E only)
EXPO_PUBLIC_TEST_MODE=""         # "true" shows test-only UI / disables pay animations
EXPO_PUBLIC_PAY_API_BASE_URL=""  # Override WCPay API base URL (blank = walletkit default)
SENTRY_DISABLE_AUTO_UPLOAD=true  # Build-time only: disable Sentry auto upload (Android)
```

## E2E Testing (Maestro)

### Test IDs Convention
The app uses standardized `testID` props for Maestro E2E testing. These IDs are designed to be reused across wallet implementations (React Native, Flutter, Swift, Kotlin):

- `button-*`: Tappable UI elements (e.g., `button-scan`, `button-paste-url`)
- `pay-*`: WalletConnect Pay flow elements (e.g., `pay-merchant-info`, `pay-button-pay`, `pay-result-success-icon`)

### Test Files
- `.maestro/pay_single_option_nokyc.yaml`: Single payment option, no KYC — goes straight to review screen
- `.maestro/pay_multiple_options_nokyc.yaml`: Multiple payment options, no KYC — option selection then review
- `.maestro/pay_multiple_options_kyc.yaml`: Multiple payment options with KYC — option selection, webview KYC flow, then review
- `.maestro/pay_usdt_polygon.yaml`: USDT on Polygon — a plain ERC-20 (no EIP-3009/2612), so WC Pay uses the Permit2 path: the wallet sends an `approve` (allowance) tx then the payment tx. Best-effort observes the setup step via the `pay-loading-setup-note` testID (soft screenshot), then asserts the success screen. The allowance is reset to 0 after the run (see below) so each run re-exercises `approve`. (Note: USDT on Arbitrum is EIP-3009 / signature-based, so it never needs an on-chain approve — Polygon is used precisely because it does.)
- `.maestro/flows/pay_open_and_paste_url.yaml`: Shared sub-flow — opens wallet, pastes payment URL, waits for merchant info
- `.maestro/flows/pay_confirm_and_verify.yaml`: Shared sub-flow — taps Pay, verifies success screen
- `.maestro/scripts/create-payment.js`: Creates a payment via the WalletConnect Pay API (called via `runScript`)

### Running Pay Tests Locally
```bash
maestro test --env APP_ID=com.walletconnect.web3wallet.rnsample.internal --env WPAY_CUSTOMER_KEY_SINGLE_NOKYC="<key>" --env WPAY_MERCHANT_ID_SINGLE_NOKYC="<id>" --env WPAY_CUSTOMER_KEY_MULTI_KYC="<key>" --env WPAY_MERCHANT_ID_MULTI_KYC="<id>" --env WPAY_CUSTOMER_KEY_MULTI_NOKYC="<key>" --env WPAY_MERCHANT_ID_MULTI_NOKYC="<id>" --include-tags pay .maestro/
```

### Dynamic App ID
Maestro tests use `${APP_ID}` env variable instead of hardcoded bundle IDs, enabling reuse across wallet platforms. Pass via `--env APP_ID=<bundle-id>` when running tests.

### EXPO_PUBLIC_TEST_PRIVATE_KEY
When set, the wallet auto-loads this private key on startup (if no stored wallet exists). Used in CI to ensure a funded wallet is available for payment tests. The key is NOT persisted to storage — Maestro's `clearState` wipes AsyncStorage, so the env key is used on every test run.

### CI Workflow
`.github/workflows/ci_e2e_walletkit.yaml` runs Maestro tests on both iOS (simulator) and Android (emulator). Triggers on PRs/pushes to main when `wallets/rn_cli_wallet/` or `.maestro/` files change.

### Permit2 allowance reset (USDT)
After the suite runs, the composite action (`.github/actions/walletkit-build-and-maestro`) calls the shared `WalletConnect/actions/maestro/permit2-reset` action to reset the USDT-on-Polygon Permit2 allowance back to 0, so `pay_usdt_polygon` always re-exercises the `approve` step. It signs a transaction (so it's a Node step, not a Maestro `runScript`); the private key is passed via env, never the CLI. `.github/workflows/e2e-balance-check.yml` also monitors USDT + POL (gas) on Polygon and pings the faucet bot on Slack when low.

## Development

### Prerequisites
- Node.js >= 20
- Yarn 3.8.7
- Ruby 3.3.0 (for iOS/CocoaPods)
- Xcode & Android Studio

### Native projects (Continuous Native Generation)
`ios/` and `android/` are **not committed** — they are generated by `expo prebuild`
from `app.json` / `app.config.js` / `plugins/` / `assets/`. `yarn ios` / `yarn android`
run prebuild automatically when the folders are missing. Never hand-edit `ios/`
or `android/`; change the Expo config or a config plugin and re-run prebuild.

### Android NDK version — re-check on every RN/Expo upgrade
The Android NDK version is pinned in `app.json` via `plugins/withAndroidNdkVersion.js`
(a plugin arg: `["./plugins/withAndroidNdkVersion.js", { "ndkVersion": "…" }]`). This
one value is the single source of truth: the plugin injects it into the generated
`android/build.gradle`, and the E2E workflow
(`.github/actions/walletkit-build-and-maestro`) reads the same `app.json` entry to
pre-install that exact NDK via `sdkmanager`. The pre-install exists because RN
otherwise fetches the NDK on the fly at build time, and that download intermittently
lands corrupted on CI runners (`Archive is not a ZIP archive` →
`InstallFailedException`) — failing the build but passing on rerun.

**On any `react-native` / `expo` bump, verify this value still matches Expo's default
NDK and update it if not.** Expo owns the default (`ExpoRootProjectPlugin`:
`setIfNotExist("ndkVersion") { … }`) and bumps it across SDK versions. If our pin
drifts below what the new build wants, the pre-install seeds the wrong NDK, Gradle
re-fetches the right one at build time, and the corrupt-download flake returns. To
confirm the current default: run `yarn prebuild` and check the `ndkVersion` line in
`android/build.gradle`, or read the default in
`node_modules/expo-modules-autolinking/.../ExpoRootProjectPlugin.kt`.

### Setup
```bash
yarn install
cp .env.example .env          # set EXPO_PUBLIC_PROJECT_ID etc.
yarn prebuild                 # generate ios/ + android/ (seeds android/secrets.properties)
yarn android    # or yarn ios
```

### Scripts
- `yarn start`: Start Metro bundler
- `yarn prebuild`: Generate native projects (`expo prebuild`)
- `yarn android` / `yarn ios`: Run debug build (production variant)
- `yarn ios:internal`: Run iOS internal variant (`APP_VARIANT=internal`)
- `yarn android:internal`: Run Android internal variant (`--variant internal`)
- `yarn android:build`: `assembleRelease` (production APK)
- `yarn android:build:internal`: `assembleInternal` (internal APK)
- `yarn lint` / `yarn test` / `yarn e2e`

### Build Variants
Variants are produced **without** committed native dirs:
- **iOS** — `APP_VARIANT` (see `app.config.js`) sets the bundle id + icon at prebuild
  (`production` = base id, `internal` = `.internal`, `debug` = `.debug`).
- **Android** — a Gradle `internal` buildType (`plugins/withAndroidVariants.js`)
  applies the `.internal` suffix + signing, so `assembleInternal` / `assembleRelease`
  work as before. Signing keys come from `android/secrets.properties`
  (seeded from `secrets.properties.mock` by `scripts/setup-secrets.js` on `postprebuild`;
  CI provides the real file).

## Common Patterns

### WalletKit Initialization

```typescript
// hooks/useInitializeWalletKit.ts
import { WalletKit } from '@reown/walletkit';

const walletKit = await WalletKit.init({
  core,
  metadata: {
    name: 'RN Wallet',
    // ...
  },
});
```

### Handling Session Requests

```typescript
// utils/EIP155RequestHandlerUtil.ts
export async function approveEIP155Request(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent;
  // Handle different methods: personal_sign, eth_sendTransaction, etc.
}
```

The UI side of a request is data-driven — see **Request Handling Modals →
Adding a new request type / method** for how a method maps to the generic
`SessionRequestModal` via `modals/requestConfig.ts`.

### Chain-Specific Libraries

```typescript
// lib/EIP155Lib.ts
import { Wallet } from 'ethers';

class EIP155Lib {
  wallet: Wallet;

  signMessage(message: string) {
    return this.wallet.signMessage(message);
  }

  sendTransaction(transaction: TransactionRequest) {
    return this.wallet.sendTransaction(transaction);
  }
}
```

### Valtio State

```typescript
import { proxy, useSnapshot } from 'valtio';

export const SettingsStore = proxy({
  eip155Address: '',
  suiAddress: '',
  tonAddress: '',
  tronAddress: '',
  sessions: [],
});

// In component
const { eip155Address } = useSnapshot(SettingsStore);
```

### Pressable Components (Button)

**Always use the custom `Button` component instead of `TouchableOpacity` or `Pressable`.**

The app uses a custom `Button` component that wraps `PressableScale` from the `pressto` package, providing smooth scale animations on press.

```typescript
import { Button } from '@/components/Button';

// Basic usage
<Button onPress={handlePress} style={styles.myButton}>
  <Text>Press me</Text>
</Button>

// With disabled state
<Button onPress={handlePress} disabled={isLoading}>
  <Text>Submit</Text>
</Button>

// With hitSlop for larger touch targets
<Button onPress={handlePress} hitSlop={40}>
  <Icon name="close" />
</Button>
```

**Button Props:**
- `children`: React.ReactNode (required)
- `onPress`: () => void (required)
- `style`: StyleProp<ViewStyle> (optional)
- `disabled`: boolean (optional, default: false)
- `hitSlop`: number | Insets (optional)
- `testID`: string (optional)

**Why not TouchableOpacity?**
- `PressableScale` provides a native-feeling scale animation
- Consistent UX across the app
- Better performance with Reanimated-powered animations

**Important:** The app wraps the root and modal content with `GestureHandlerRootView` (required for pressto to work on Android).

## Code Quality Guidelines

### Android Version Code

**Always increment the `versionCode` when creating a new feature, fix, or PR:**

The Android `versionCode` is located in `android/app/build.gradle`. Before submitting a PR, increment this value by 1:

```gradle
android {
    defaultConfig {
        versionCode 57  // Increment this value
    }
}
```

This ensures each build has a unique version identifier for distribution and updates.

### After Making Changes

**Always run these checks and fix any errors before committing:**

```bash
yarn format           # Format code with Prettier
yarn lint             # Check for ESLint errors
npx tsc --noEmit      # Check for TypeScript errors
```

### Style
- Use TypeScript strict mode
- Follow ESLint + Prettier configuration
- Use path aliases (`@/`) for imports
- Handle all blockchain errors gracefully
- Show toast notifications for user feedback
- Log important events via `LogStore` (e.g., `LogStore.log()`, `LogStore.warn()`, `LogStore.error()`)
- Test signing flows on testnets before mainnet
