## React Native Dapp (V2 Explorer)

This is a React Native Application that uses the `rn_cli` client.

This example uses

- WalletConnect's Universal Provider | [Docs](https://docs.walletconnect.com/2.0/javascript/providers/universal)
- WalletConnect's Explorer API | [Explorer Site](https://explorer.walletconnect.com/)
- Ethers

### Installation

Inside this directory (`dapps/v2Explorer`), install React Native

```bash
yarn
```

Set up your own `.env` file from the example and **replace `ENV_PROJECT_ID` with your own ProjectId from https://cloud.walletconnect.com**

```bash
cp .env.example .env
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
