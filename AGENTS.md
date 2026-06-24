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

To update **only the changed lockfile entries** (this is NOT a full lockfile regeneration — see the warning above; it re-resolves just the dependencies your override touched and leaves the rest of the lock alone) while iterating on overrides:
- npm: `npm install --package-lock-only --ignore-scripts` — writes `package-lock.json` only, does not create/modify `node_modules`.
- yarn berry (3.x): `yarn install --mode=update-lockfile` — writes `yarn.lock` only, skips the fetch/link steps.
- yarn classic (1.x): has **no** lockfile-only mode. `yarn install --ignore-scripts` still fetches and links `node_modules` (only the lifecycle/postinstall scripts are skipped); the `yarn.lock` diff stays small because only the re-resolved entries change. Always sanity-check the diff before committing.

### Upgrades that break things (learned the hard way)

- **uuid majors.** `uuid@14` requires Node ≥20 and a global `crypto` (RN needs the `react-native-get-random-values` polyfill; web/Vercel must expose `crypto`). The POS apps depend on `uuid@14` directly and work because that polyfill is installed — do not assume a fresh app will. For **transitive** uuid, pinning to `uuid@11.1.1` is safe (every consumer here is ≥7.0.3, past the v7 removal of the default export and `uuid/v4` deep paths), but **do not** force transitive uuid to 14. When an app *directly* depends on `uuid` (e.g. `14`), npm rejects a top-level `uuid` override to a different version — scope it instead: `"overrides": { "xcode": { "uuid": "11.1.1" } }` (the old uuid usually comes only from `xcode`, a host-side prebuild tool, never bundled).
- **Pinned overrides drift into being the *source* of alerts.** Versions like `tar`, `js-yaml`, `undici`, `hono`, `tmp` are pinned for build stability; over time the pinned version itself gets a CVE. Fix by **bumping the pin to the new patched version — never by deleting the override** (dropping it lets the resolver pick a version that breaks the build, especially the Vercel web build in `pos-app`).
- **Vercel `@vercel/node` undici.** `pos-app` pins `@vercel/node`'s nested `undici` (vercel-only serverless tooling for `api/*`). undici has no patched 5.x line, so the fix requires the 6.x line — bumping it is correct but **must be verified on the Vercel preview deploy**, not just the local `web:build` (which doesn't build the serverless functions). Keep the pin scoped under `@vercel/node`.
- **Do NOT bump `ws` past `8.18.1`** in the React Native apps. `ws@8.19+`'s `lib/permessage-deflate.js` has a top-level `require('zlib')`, and once that path is bundled Metro fails the release bundle with `Unable to resolve module zlib` (`:app:createBundleInternalJsAndAssets FAILED` / `react-native bundle`). `ws@8.18.1` is the highest bundle-safe version and is pinned deliberately in the W3M apps for that reason — leave the npm apps' `ws` transitive (do not add an override). `ws` is a Node-only transitive dep (RN uses the native WebSocket), so its DoS advisories are not exploitable in the RN runtime; the `ws` Dependabot alerts are dismissed rather than fixed. Reproduce locally with `npx react-native bundle --entry-file index.js --platform android --dev false --bundle-output /tmp/b.js` before touching `ws`.
- **`tmp@0.2.6` is itself vulnerable** (GHSA-7c78); use `tmp@0.2.7`.
- **Keep `@babel/core` and `@babel/helpers` in sync.** W3MEthers/W3MEthers5 pin `@babel/helpers`/`@babel/runtime` in `resolutions`; if `@babel/core` resolves to 7.29.x (it does, transitively) while `@babel/helpers` is pinned below `7.29.2`, Metro crashes at bundle time with `helpers(...).isInternal is not a function` (`@babel/core` 7.27+ calls `helpers.isInternal`). Bump both to a matching 7.29.x — note the packages don't share an exact version (e.g. `@babel/core@7.29.6` pairs with `@babel/helpers@7.29.7`; there is no `@babel/helpers@7.29.6`). The other apps don't pin helpers, so they self-resolve and are unaffected.
- **`concurrent-ruby < 1.3.4`** was pinned in some `Gemfile`s to dodge the broken 1.3.4 `logger` regression. With `gem 'logger'` present (it is), `1.3.7` is safe — pin to `1.3.7` rather than capping below the security fix.
- **`faraday`** is capped at `~> 1.0` by fastlane; its CVE fix (`2.14.3`) is a major that fastlane won't allow. Don't force it — dismiss the alert (CI release tooling only) or upgrade fastlane deliberately.
