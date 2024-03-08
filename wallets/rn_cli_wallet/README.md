## React Native CLI Wallet

This is a React Native Application that uses the `react-native` CLI client.

### Installation

Inside this directory (`wallets/rn_cli_wallet`), install the React Native dependencies:

```bash
yarn
```

Set up your own `.env.debug` file from the example and **replace `ENV_PROJECT_ID` with your own ProjectId from https://cloud.walletconnect.com**

```bash
cp .env.example .env.debug
```

For dev purposes, setup mocked google-services files
```bash
cp android/app/google-services.mock.json android/app/google-services.json
cp ios/GoogleService/GoogleService-Info.mock.plist ios/GoogleService/GoogleService-Debug-Info.plist
```

### Setup (iOS)

If CocoaPods is not installed on your system yet:

```bash
brew install cocoapods
```

Install iOS deps:

```bash
cd ios
pod install
```

To run:

- `npx react-native run-ios`

### Setup (Android)

1. Follow the [official Environment Setup guidance](https://reactnative.dev/docs/environment-setup) for Android (select `Android` for `Target OS`) to install Android Studio etc.
2. Set up either a virtual or physical device as outlined in the _Preparing the Android device_ section of the guidance.

To run:

- `npx react-native run-android`
