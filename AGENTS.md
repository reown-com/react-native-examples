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

## Dependency Rules

### No caret versions in package.json

All dependency versions in `package.json` must be pinned to exact versions. Do not use `^` or `~` prefixes. For example, use `"react-native": "0.76.9"` instead of `"react-native": "^0.76.9"`. This applies to `dependencies`, `devDependencies`, `overrides`, and `resolutions`.

### Never regenerate lock files

**WARNING: Do not delete or regenerate lock files (yarn.lock / package-lock.json).** Regenerating a lock file causes massive version churn across the entire dependency tree and will break builds. Only make targeted, minimal changes to lock files. If you need to update a dependency, modify `package.json` and run the package manager — it will update only the affected entries in the lock file.

### Dependency Security (Dependabot alerts)

When Dependabot flags security vulnerabilities in transitive dependencies, fix them by adding overrides/resolutions to `package.json` only. Do not regenerate lock files.

#### For npm projects (package-lock.json)

Add to `overrides` in package.json:

```json
{
  "overrides": {
    "vulnerable-package": "fixed-version"
  }
}
```

#### For yarn projects (yarn.lock)

Add to `resolutions` in package.json:

```json
{
  "resolutions": {
    "vulnerable-package": "fixed-version"
  }
}
```

After adding overrides/resolutions, run `npm install` or `yarn install` in the specific project directory. Verify the lock file diff is small and targeted — if it shows thousands of changed lines, something went wrong. Do not commit large lock file diffs.
