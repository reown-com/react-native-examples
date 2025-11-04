# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Sentry Configuration

This project uses [Sentry](https://sentry.io/) for error tracking and monitoring. Before building the app, you need to configure Sentry authentication.

### Option 1: Using Sentry Wizard (Recommended)

Run the Sentry wizard to automatically configure your project:

```bash
npx @sentry/wizard@latest -i reactNative
```

This will:
- Create/update the `sentry.properties` file in the `android/` and `ios/` directories
- Set up your authentication token
- Configure source map uploading

### Option 2: Manual Configuration

If you prefer to configure manually, you can set the `SENTRY_AUTH_TOKEN` environment variable:

```bash
# DO NOT COMMIT YOUR AUTH TOKEN
export SENTRY_AUTH_TOKEN=sntrys_YOUR_TOKEN_HERE
```

Alternatively, you can add the token directly to the `sentry.properties` files:

**android/sentry.properties** and **ios/sentry.properties**:
```properties
defaults.url=https://sentry.io/
defaults.org=walletconnect
defaults.project=mobile-pos-react-native
auth.token=YOUR_AUTH_TOKEN_HERE
```

> **⚠️ Security Note**: Never commit your Sentry auth token to version control. Add `sentry.properties` to your `.gitignore` file.

### Getting Your Auth Token

1. Log in to [sentry.io](https://sentry.io/)
2. Go to Settings → Account → API → Auth Tokens
3. Create a new token with the following scopes:
   - `project:read`
   - `project:releases`
   - `org:read`

For more information on source maps and Expo integration, see the [Sentry Expo Documentation](https://docs.sentry.io/platforms/react-native/sourcemaps/uploading/expo/).

## Android Release Configuration

To build Android release versions of the app, you need to create a `secrets.properties` file in the `android/` directory with your keystore credentials.

### Option 1: Testing with Debug Signing (Recommended for Development)

For testing purposes, you can use the debug signing configuration. In `android/app/build.gradle`, ensure the release build type uses the debug signing config:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.debug
        // ... other release configurations
    }
}
```

This allows you to build release APKs without setting up a production keystore.

### Option 2: Production Signing with secrets.properties

For production releases, create a file at `android/secrets.properties` with the following content:

```properties
WC_FILENAME_UPLOAD=path/to/your-keystore.keystore
WC_STORE_PASSWORD_UPLOAD=your_store_password
WC_KEYSTORE_ALIAS=your_key_alias
WC_KEY_PASSWORD_UPLOAD=your_key_password
```

Then update the release signing config in `android/app/build.gradle` to use the release signing configuration instead of debug.

### Generating a Keystore

If you don't have a keystore file yet, you can generate one using the following command:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

This will prompt you to create passwords for the keystore and key. Make sure to:
- Store the keystore file in a secure location
- Remember the passwords you set
- Never commit the keystore file or `secrets.properties` to version control

> **⚠️ Security Note**: The `secrets.properties` file is already excluded in the `.gitignore`. Never commit this file or your keystore to version control.

For more information on Android app signing, see the [React Native documentation](https://reactnative.dev/docs/signed-apk-android).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
