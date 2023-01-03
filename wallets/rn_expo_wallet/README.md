## React Native Expo Wallet

This is a React Native Application that uses the `expo` CLI client.

### Installation

Inside this directory (`wallets/rn_expo_wallet`), install the React Native / Expo dependencies:

```bash
yarn
```

Set up your own `.env` file from the example and **replace `ENV_PROJECT_ID` with your own ProjectId from https://cloud.walletconnect.com**

```bash
cp .env.example .env
```

### Setup

```bash
yarn start
```

After `yarn start` , a Metro Bundler should appear with several platform options to use Expo.

- Press a │ open Android
- Press i │ open iOS simulator
- Press w │ open web
