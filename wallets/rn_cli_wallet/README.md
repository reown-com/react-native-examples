# WalletKit example

## Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Install Dependencies

```bash
yarn install
```

## Step 2: Create mocked google-service files
In order to build the app successfuly, you'll need some extra files

```bash
chmod +x ./scripts/copy-sample-files.sh && ./scripts/copy-sample-files.sh
```

## Step 3: Open .env.debug file and replace **ENV_PROJECT_ID with your [Cloud Project ID](https://cloud.reown.com/)


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
