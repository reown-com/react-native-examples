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
- **ethers** (5.8.0): Ethereum/EVM interactions
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
│   │   ├── SessionSignModal.tsx
│   │   ├── SessionSendTransactionModal.tsx
│   │   ├── SessionAuthenticateModal.tsx
│   │   ├── ImportWalletModal.tsx
│   │   ├── SessionSuiSignAndExecuteTransactionModal.tsx
│   │   ├── SessionTonSignDataModal.tsx
│   │   ├── SessionTonSendMessageModal.tsx
│   │   ├── SessionSignTronModal.tsx
│   │   ├── PaymentOptionsModal/  # WalletConnect Pay
│   │   └── RequestModal.tsx
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
- `SessionSignModal`: Message signing
- `SessionSendTransactionModal`: EVM transactions
- `SessionAuthenticateModal`: SIWE authentication
- `SessionSuiSignAndExecuteTransactionModal`: Sui transactions
- `SessionTonSignDataModal` / `SessionTonSendMessageModal`: TON
- `SessionSignTronModal`: Tron signing

## Environment Variables

Required in `.env`:
```bash
ENV_PROJECT_ID=""              # WalletConnect Project ID (required)
ENV_SENTRY_DSN=""              # Sentry error tracking (optional)
ENV_TON_CENTER_API_KEY=""      # TON blockchain API key (optional)
ENV_BLOCKCHAIN_API_URL=""      # Blockchain API URL (to get wallet balances)
ENV_TEST_PRIVATE_KEY=""        # Private key for funded test wallet (Maestro E2E only)
SENTRY_DISABLE_AUTO_UPLOAD=true  # Disable Sentry auto upload for Android builds
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

### ENV_TEST_PRIVATE_KEY
When set, the wallet auto-loads this private key on startup (if no stored wallet exists). Used in CI to ensure a funded wallet is available for payment tests. The key is NOT persisted to storage — Maestro's `clearState` wipes AsyncStorage, so the ENV key is used on every test run.

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

### Setup
```bash
yarn install
cp .env.example .env
# Edit .env with your project ID
yarn android    # or yarn ios
```

### Scripts
- `yarn start`: Start Metro bundler
- `yarn android`: Run on Android (debug)
- `yarn ios`: Run on iOS (debug scheme)
- `yarn ios:internal`: Run iOS internal scheme
- `yarn android:build`: Build release APK
- `yarn lint`: Run ESLint
- `yarn test`: Run Jest tests
- `yarn e2e`: Run Maestro E2E tests

### Build Variants
```bash
yarn run copy:debug      # Debug configuration
yarn run copy:internal   # Internal testing
yarn run copy:production # Production release
```

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
