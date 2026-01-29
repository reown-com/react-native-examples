# React Native Examples - Agent Guide

This repository contains sample React Native applications demonstrating WalletConnect and Reown integrations.

## Repository Structure

```
/
├── dapps/          # Sample dApps (decentralized applications)
└── wallets/        # Sample wallet implementations
```

## Sample Apps

### dApps

| App | Description | AGENTS.md |
|-----|-------------|-----------|
| appkit-expo-wagmi | Expo + Wagmi integration | - |
| ModalEthers | WalletConnect Modal with Ethers.js | - |
| ModalUProvider | WalletConnect Modal with UProvider | - |
| ModalViem | WalletConnect Modal with Viem | - |
| poc-pos-app | Point of Sale proof of concept | [View](dapps/poc-pos-app/AGENTS.md) |
| pos-app | Point of Sale application | [View](dapps/pos-app/AGENTS.md) |
| W3MEthers | AppKit with Ethers.js | - |
| W3MEthers5 | AppKit with Ethers.js v5 | - |
| W3MWagmi | AppKit with Wagmi | [View](dapps/W3MWagmi/AGENTS.md) |

### Wallets

| App | Description | AGENTS.md |
|-----|-------------|-----------|
| expo-wallet | Expo-based sample wallet | [View](wallets/expo-wallet/AGENTS.md) |
| rn_cli_wallet | React Native CLI wallet | [View](wallets/rn_cli_wallet/AGENTS.md) |

## Dependency Security

When Dependabot flags security vulnerabilities in transitive dependencies, fix them by adding overrides/resolutions to `package.json`, not by editing lockfiles directly.

### For npm projects (package-lock.json)

Add to `overrides` in package.json:

```json
{
  "overrides": {
    "vulnerable-package": "fixed-version"
  }
}
```

### For yarn projects (yarn.lock)

Add to `resolutions` in package.json:

```json
{
  "resolutions": {
    "vulnerable-package": "fixed-version"
  }
}
```

Then run `npm install` or `yarn install` to update the lockfile.
