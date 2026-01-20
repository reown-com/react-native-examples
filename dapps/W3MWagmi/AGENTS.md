# Agent Documentation: W3MWagmi

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

**W3MWagmi** is a React Native sample application demonstrating the **Reown AppKit SDK** for multichain Web3 integration. It showcases wallet connection, signing, and transaction capabilities across multiple blockchain ecosystems:

- **EVM chains** (Ethereum, Polygon, Arbitrum, Optimism, Base, etc.)
- **Solana** (via Phantom & Solflare wallets)
- **Bitcoin** (PSBT signing)

This is a reference implementation for developers building dApps with Reown AppKit.

## Tech Stack

### Core Technologies
- **React Native**: 0.81.4
- **React**: 19.1.0
- **TypeScript**: ^5.8.3
- **Expo**: 54.0.20

### Reown AppKit SDKs
- **@reown/appkit-react-native**: Core AppKit SDK
- **@reown/appkit-wagmi-react-native**: EVM integration via Wagmi
- **@reown/appkit-solana-react-native**: Solana support
- **@reown/appkit-bitcoin-react-native**: Bitcoin support
- **@reown/appkit-coinbase-react-native**: Coinbase wallet integration

### Blockchain Libraries
- **wagmi**: EVM hooks & utilities
- **viem**: Ethereum JavaScript client
- **@solana/web3.js**: Solana client
- **bitcoinjs-lib**: Bitcoin library

### Key Libraries
- **@react-navigation**: Navigation (native-stack, bottom-tabs)
- **valtio**: Reactive state management
- **@tanstack/react-query**: Server state management
- **react-native-mmkv**: Fast key-value storage
- **@sentry/react-native**: Error tracking

## Architecture

### Project Structure

```
W3MWagmi/
├── src/
│   ├── App.tsx              # Root component with providers
│   ├── screens/
│   │   ├── Connections/     # Main wallet connection & actions
│   │   │   └── components/  # Chain-specific action views
│   │   │       ├── ActionsView.tsx
│   │   │       ├── WagmiActionsView.tsx    # EVM transactions
│   │   │       ├── SolanaActionsView.tsx   # Solana actions
│   │   │       ├── BitcoinActionsView.tsx  # Bitcoin actions
│   │   │       ├── WalletInfoView.tsx
│   │   │       └── EventsView.tsx
│   │   ├── Settings/        # Device & wallet info
│   │   ├── LogList/         # App activity logs
│   │   └── AppKitLogList/   # AppKit library logs
│   ├── navigators/
│   │   ├── RootStackNavigator.tsx
│   │   └── HomeTabNavigator.tsx
│   ├── stores/
│   │   └── SettingsStore.ts  # Valtio-based state
│   ├── utils/
│   │   ├── WagmiUtils.ts     # Chain configuration
│   │   ├── BitcoinUtil.ts    # Bitcoin helpers
│   │   ├── eip712.ts         # EIP-712 signing
│   │   └── ...
│   ├── hooks/
│   │   ├── useLogs.ts
│   │   ├── useSocketStatus.ts
│   │   └── useTheme.ts
│   └── assets/
├── android/
├── ios/
├── scripts/
└── package.json
```

### State Management

- **Valtio**: Lightweight reactive proxy-based state (`stores/SettingsStore.ts`)
- **React Query**: Server state and caching for blockchain data

### Navigation

Uses **React Navigation** with:
- Bottom tab navigator (4 tabs: Connections, Settings, Logs, AppKit Logs)
- Stack navigator for modal screens

## Key Features

### Wallet Connection
- AppKit modal for wallet selection
- Support for 14+ EVM chains
- Solana wallet integration (Phantom, Solflare)
- Bitcoin wallet support
- Coinbase Wallet Mobile SDK
- WalletConnect Link Mode

### Blockchain Actions

**EVM (Wagmi)**
- Sign message
- Send transactions
- Estimate gas
- Sign typed data (EIP-712)

**Solana**
- Sign message
- Sign transaction
- Send transaction

**Bitcoin**
- Sign message (ECDSA)
- Sign PSBT

### Developer Features
- Real-time socket status monitoring
- App activity logs
- AppKit library event logs
- Device information display

## Environment Variables

Required in `.env`:
```bash
ENV_PROJECT_ID=""              # Reown dashboard project ID (required)
ENV_SENTRY_DSN=""              # Sentry error tracking (optional)
SENTRY_DISABLE_AUTO_UPLOAD=true  # Disable Sentry auto upload for Android builds
```

## Development

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
- `yarn ios`: Run on iOS
- `yarn android:build`: Build release APK
- `yarn lint`: Run ESLint
- `yarn test`: Run Jest tests

### Build Variants
- **debug**: Local development
- **internal**: Internal testing
- **production**: Release builds

```bash
yarn run copy:debug      # Copy debug config files
yarn run copy:internal   # Copy internal config files
yarn run copy:production # Copy production config files
```

## Common Patterns

### AppKit Setup (App.tsx)

```typescript
import { createAppKit } from '@reown/appkit-react-native';
import { WagmiProvider } from 'wagmi';

// Initialize AppKit with project ID and chains
createAppKit({
  projectId: ENV_PROJECT_ID,
  // ... configuration
});
```

### Using Wagmi Hooks

```typescript
import { useAccount, useSignMessage, useSendTransaction } from 'wagmi';

const { address, isConnected } = useAccount();
const { signMessage } = useSignMessage();
```

### Valtio State

```typescript
import { proxy, useSnapshot } from 'valtio';

const SettingsStore = proxy({
  // state
});

// In component
const { value } = useSnapshot(SettingsStore);
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
- Handle errors with toast notifications
- Log important events for debugging
