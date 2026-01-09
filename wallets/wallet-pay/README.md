# Expo Wallet

A sample WalletConnect wallet built with Expo and React Native, demonstrating secure key management and WalletKit integration.

## Features

- 🔐 Secure mnemonic storage using `expo-secure-store` (iOS Keychain / Android Keystore)
- ⚡ Native crypto performance with `react-native-quick-crypto`
- 🔗 WalletConnect WalletKit integration for dApp connections
- 🏗️ Plugin-based architecture for multi-chain support (EVM now, Solana/Sui/TON/Tron later)

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Architecture

```
lib/
├── base/wallet-base.ts          # IWallet interface for all chains
└── chains/evm/
    ├── evm-wallet.ts            # EVM wallet (viem)
    └── evm-request-handler.ts   # WalletKit request handlers

stores/use-wallet-store.ts       # Zustand wallet state
hooks/use-wallet-initialization.ts # Wallet init on startup
utils/secure-storage.ts          # expo-secure-store wrapper
```

## Security Considerations

> ⚠️ **This is a sample/demo wallet for educational purposes.**

### What's Protected

| Data | Storage | Protection |
|------|---------|------------|
| Mnemonic | `expo-secure-store` | iOS Keychain / Android Keystore (encrypted at rest) |
| Private Key | In-memory only | Never persisted to disk |
| Addresses | Zustand store | Non-sensitive, public data |

### Known Limitations (Hot Wallet Trade-offs)

This wallet keeps the derived private key (`HDAccount`) in memory while the app is running. This is **standard for all hot wallets** (MetaMask, Rainbow, Trust Wallet, etc.) and is required for signing operations.

**Mitigations provided by the platform:**
- iOS/Android process isolation prevents other apps from reading memory
- Mnemonic is encrypted at rest in secure storage

**For production wallets, consider:**
- Biometric authentication on app resume
- Clearing sensitive data when app backgrounds
- Hardware wallet integration for large holdings
- Security audit before production release

### Disabled Features

- `eth_sign` is disabled (auto-rejected) to prevent phishing attacks. Use `personal_sign` instead.

## Learn More

- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [viem Documentation](https://viem.sh/)
