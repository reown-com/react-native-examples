# React Native Examples

React Native examples implementing WalletConnect v2

Catalogue of wallet and dapp examples WalletConnect's various SDKs via React Native. Each example contains its own README with further instructions and explanations.

### Wallet (Demo)

https://user-images.githubusercontent.com/45455218/217548710-778dbba8-5a5a-4f48-86c2-c3299347083b.mov

### Dapp (Demo)

https://user-images.githubusercontent.com/45455218/220603463-a8c4dc92-1209-443c-998c-a613bf3f1adb.mp4

## Wallets

Full Example

- React Native CLI Wallet (0.68.5) `wallets/rn_cli_wallet_068_5`

Skeleton Example (WIP)

- React Native CLI Wallet `wallets/rn_cli_wallet`
- React Native Expo Wallet `wallets/rn_expo_wallet`

## Dapps

- Dapp V2 Explorer: `dapps/v2Explorer` or by checking out the alpha SDK [here](https://github.com/WalletConnect/web3modal-react-native)

## Getting Started

- Ensure your[ React Native environment](https://reactnative.dev/docs/next/environment-setup) has been properly setup (XCode, ruby etc). Note for Mac users to have the correct Ruby versions if doing a fresh install.
- Read through our [React Native guide](https://docs.walletconnect.com/2.0/reactnative/overview)
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

## Support

Feel free to reach out to WalletConnect via [Discord](https://discord.com/invite/kdTQHQ6AFQ) in the Developer Support channels.
