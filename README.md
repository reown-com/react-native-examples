# React Native Examples

React Native examples implementing WalletConnect v2

Catalogue of wallet and dapp examples WalletConnect's various SDKs via React Native. Each example contains its own README with further instructions and explanations.

## Getting Started

- Ensure your[ React Native environment](https://reactnative.dev/docs/next/environment-setup) has been properly setup (XCode, ruby etc). Note for Mac users to have the correct Ruby versions if doing a fresh install.
- Read through our [JS-React Native guide](https://docs.walletconnect.com/2.0/javascript/guides/react-native)
- Check the respective `/wallet` folder to see the `rn_cli_wallet` or `rn_expo_wallet` repo
- Read through the various README files for further information
- Submit any issues / feature requests.

Note:
If you are switching between these wallets (i.e. `rn_cli_068_5` & `rn_cli_070_6`), it is recommended to clear caches using the following command:

```
watchman watch-del-all && rm -rf node_modules/ && yarn cache clean && yarn install && yarn start -- --reset-cache
```

If you run into issues with the simulator version:

```
npx react-native run-ios
error No simulator available with name "iPhone 13".
```

Change the flag with:

```
npx react-native run-ios --simulator="iPhone 14"
```

If you have `/ios` or Pod Issues, delete the `Podfile.lock` and re-run `pod update && pod install` worked for my case

## Wallets

- React Native CLI Wallet
- React Native Expo Wallet

## Support

Feel free to reach out to WalletConnect via [Discord](https://discord.com/invite/kdTQHQ6AFQ) in the Developer Support channels.
