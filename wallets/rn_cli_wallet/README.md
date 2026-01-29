# WalletKit example

## Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Prerequisites: Ruby Setup (for iOS)

This project requires **Ruby 3.3.0** for CocoaPods. macOS ships with an outdated system Ruby (2.6) that doesn't work with newer Xcode versions. You'll need to install a modern Ruby version using a version manager like rbenv.

### Install rbenv and Ruby 3.3.0

1. **Install rbenv via Homebrew:**
```bash
brew install rbenv ruby-build
```

2. **Initialize rbenv in your shell:**
```bash
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc
```

3. **Install Ruby 3.3.0:**
```bash
rbenv install 3.3.0
```

4. **Verify installation** (from the project directory):
```bash
ruby -v  # Should show ruby 3.3.0
```

The `.ruby-version` file in this project will automatically tell rbenv to use 3.3.0.

## Step 1: Install Dependencies

```bash
yarn install
```

## Step 2: Create sample configuration files
In order to build the app successfully, you'll need some configuration files (env, keystore, secrets)

```bash
chmod +x ./scripts/copy-sample-files.sh && ./scripts/copy-sample-files.sh
```

## Step 3: Configure environment variables

Open `.env` file and set the following values:
- **ENV_PROJECT_ID**: Your [Project ID](https://dashboard.reown.com/)
- **ENV_SENTRY_DSN** (optional): Get it from your [Sentry dashboard](https://sentry.io/) or run `npx @sentry/wizard@latest -i reactNative` to set up Sentry
- **ENV_TON_CENTER_API_KEY** (optional): Your [TON Center API key](https://toncenter.com/) for TON blockchain support

## Step 4: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
yarn android
```

### For iOS

```bash
cd ios && pod install
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## TODOs

- [ ] Unify wallet addresses into a single source of truth (currently split between module-level exports in *WalletUtil files and SettingsStore)
