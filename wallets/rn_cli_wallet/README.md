# Web3Wallet example

## Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Install Dependencies

```bash
yarn install
```

## Step 2: Create a .env file and replace **ENV_PROJECT_ID with your [Cloud Project ID](https://cloud.walletconnect.com/)

```bash
cp .env.example .env.debug
```

## Step 3: Create mocked google-service files
In order to build the app successfuly, you'll need some google-service files

```bash
cp android/app/google-services.mock.json android/app/google-services.json
cp ios/GoogleService/GoogleService-Info.mock.plist ios/GoogleService/GoogleService-Debug-Info.plist
```

## Step 4: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
yarn android
```

### For iOS

```bash
yarn ios
cd ios && pod install
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.
