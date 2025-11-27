# Welcome to POS Sample app

## Prerequisites

Before you begin, make sure you have set up your React Native development environment. This includes installing Node, Android Studio (for Android), and Xcode (for iOS on macOS).

Follow the official React Native documentation to set up your environment:
- [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment?platform=android)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   Create a `.env` file using the example template:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration values.

3. Create native folders

   ```bash
   npm run prebuild
   ```

   This will automatically set up the required files for development.

4. Start the app

   ```bash
   npm run android
   ```

   ```bash
   npm run ios
   ```

   ```bash
   npm run web
   ```

## Production Releases

For production Android releases, you'll need the actual `secrets.properties` file and `wc_rn_upload.keystore`. Get these from the mobile team or 1Password.

**Required file locations:**
- Place `secrets.properties` in the `android/` directory
- Place `wc_rn_upload.keystore` in the `android/app/` directory

```
android/
├── secrets.properties          ← Place here
└── app/
    └── wc_rn_upload.keystore  ← Place here
```

**Build the release APK:**

```bash
npm run android:build
```

The release APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`

**Install on a device via USB:**

> **Note**: Make sure USB debugging is enabled on your Android device. Go to Settings → About phone → Tap "Build number" 7 times → Developer options → Enable "USB debugging".

1. Connect your device via USB and get its device ID:

   ```bash
   adb devices
   ```
   
   Example output: `V510BAC07114B000171`

2. Build the release APK:

   ```bash
   npm run android:build
   ```

3. Install the APK on your device (replace with your device ID):

   ```bash
   adb -s V510BAC07114B000171 install android/app/build/outputs/apk/release/app-release.apk
   ```

> **⚠️ Security Note**: Never commit `secrets.properties` or keystore files to version control.