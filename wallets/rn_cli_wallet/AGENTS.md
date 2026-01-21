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
│   │   ├── ActionButton.tsx
│   │   ├── Card.tsx
│   │   ├── ConnectButton.tsx
│   │   ├── VerifyInfoBox.tsx    # EIP-4361 verification
│   │   └── Text.tsx
│   ├── store/
│   │   ├── SettingsStore.ts     # App state (addresses, sessions)
│   │   ├── ModalStore.ts        # Modal state
│   │   └── PayStore.ts          # Payment state
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
- **PayStore**: WalletConnect Pay state

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
SENTRY_DISABLE_AUTO_UPLOAD=true  # Disable Sentry auto upload for Android builds
```

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

## Code Quality Guidelines

### After Making Changes

**Always run these checks and fix any errors before committing:**

```bash
yarn lint             # Check and fix ESLint errors
yarn prettier --write . # Format code with Prettier
npx tsc --noEmit      # Check for TypeScript errors
```

### Style
- Use TypeScript strict mode
- Follow ESLint + Prettier configuration
- Use path aliases (`@/`) for imports
- Handle all blockchain errors gracefully
- Show toast notifications for user feedback
- Log important events via `useLogs` hook
- Test signing flows on testnets before mainnet
