# React Native Examples

A collection of React Native example apps showcasing [Reown](https://reown.com) AppKit and WalletKit SDKs. This repository includes sample dapps and reference wallet implementations that serve as testing grounds, learning resources, and reference code for developers integrating Reown SDKs into their projects.

## Wallets

- React Native CLI Wallet: `wallets/rn_cli_wallet`
- Expo Wallet (WIP): `wallets/expo-wallet`

## Dapps

### AppKit Apps

- AppKit + Wagmi + Multichain: `dapps/W3MWagmi`
- AppKit + Ethers: `dapps/W3MEthers`
- AppKit + Ethers v5: `dapps/W3MEthers5`
- AppKit + Expo + Wagmi: `dapps/appkit-expo-wagmi`

### POS Apps

- Point of Sale App: `dapps/pos-app`
- PoC Point of Sale App (legacy): `dapps/poc-pos-app`

### Legacy Apps (using @walletconnect/modal - deprecated)

> **Note:** These apps use the legacy `@walletconnect/modal` SDK which is deprecated. Use the AppKit apps above for new projects.

- WalletConnect Modal + Viem: `dapps/ModalViem`
- WalletConnect Modal + Ethers v5: `dapps/ModalEthers`
- WalletConnect Modal + Universal Provider: `dapps/ModalUProvider`

## Getting Started

- Ensure your [React Native environment](https://reactnative.dev/docs/next/set-up-your-environment) has been properly setup (XCode, ruby etc).
- Read our [React Native docs](https://docs.reown.com/appkit/react-native/core/installation)
- Read through the various README files for further information
- Submit any issues / feature requests.

## Fastlane

This repository uses [Fastlane](https://fastlane.tools) for iOS build automation and certificate management.

### Installation

**macOS users:** It's recommended to use [rbenv](https://github.com/rbenv/rbenv) to manage Ruby versions:

```bash
# Install rbenv via Homebrew
brew install rbenv

# Install Ruby 3.3.0
rbenv install 3.3.0

# Set it as the local version for this project
rbenv local 3.3.0
```

Then install the Ruby dependencies:

```bash
# Install Ruby dependencies (includes Fastlane and CocoaPods)
bundle install
```

### Creating Certificates for a New App

Use the provided script to create new certificates and provisioning profiles. The script handles creating a branch, running fastlane match, and creating a PR (required since the certificates repo has branch protection):

```bash
# Make the script executable (first time only)
chmod +x scripts/create-certificates.sh

# Create App Store certificates (creates PR for manual review)
./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> appstore

# Create development certificates
./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> development

# Auto-merge the PR (skip manual review)
./scripts/create-certificates.sh <certificates_repo> <bundle_id> <apple_email> appstore --auto-merge
```

**Example:**

```bash
./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com appstore
./scripts/create-certificates.sh reown-com/mobile-certificates com.reown.myapp dev@reown.com development
```

> **Note:** Requires [GitHub CLI](https://cli.github.com/) (`gh`) to be installed and authenticated. By default, the script creates a PR that requires manual merge. Use `--auto-merge` to automatically merge.

### Downloading Certificates Locally

To download existing certificates without modifying them (readonly mode):

```bash
# Download development certificates
bundle exec fastlane match development --readonly --git_url <certificates_repo_url> --app_identifier <bundle_id>

# Download App Store certificates
bundle exec fastlane match appstore --readonly --git_url <certificates_repo_url> --app_identifier <bundle_id>
```

## Configuration Files

### Sentry Configuration

The `sentry.properties` file is required for both iOS and Android to upload source maps and debug symbols. The same file content works for both platforms.

**Option 1: Sentry Wizard (recommended)**

```bash
npx @sentry/wizard@latest -i reactNative
```

This will guide you through connecting your Sentry account and automatically create the configuration files.

**Option 2: Manual creation**

Create `ios/sentry.properties` and `android/sentry.properties` with:

```properties
defaults.url=https://sentry.io/
defaults.org=<your-org>
defaults.project=<your-project>
auth.token=<your-auth-token>
```

### Google Services Files (for GitHub Secrets)

Both Android and iOS Google Services files should be base64-encoded before storing in GitHub Secrets:

```bash
# Android - encode google-services.json
base64 -i /path/to/google-services.json | pbcopy

# iOS - encode GoogleService-Info.plist  
base64 -i /path/to/GoogleService-Info.plist | pbcopy
```

The workflows will automatically decode them during the build process.

## Support

Feel free to reach out to WalletConnect via [Discord](https://discord.com/invite/kdTQHQ6AFQ) in the Developer Support channels.
