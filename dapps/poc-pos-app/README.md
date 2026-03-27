# Welcome to POC POS Sample app

> ⚠️ **WARNING: This is legacy code and is no longer actively maintained.** Use at your own risk.

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

## Creating Custom Variants

To create a branded variant for a specific client:

1. **Create a new branch**
   ```bash
   git checkout -b variant/<client-name>
   ```

2. **Add the variant logo**
   - Add the client's logo to `assets/images/variants/<client-name>_brand.png`
   - **Requirements**: PNG format

3. **Add the printer logo** in `constants/printer-logos.ts`
   - Convert the client's logo to base64 using https://base64.guru/converter/encode/image/png
   - Add the base64 string as a new constant:
     ```typescript
     export const <CLIENT_NAME>_LOGO_BASE64 =
       "data:image/png;base64,<base64-string>";
     ```

4. **Define the variant** in `constants/variants.ts`
   - Import the printer logo at the top of the file:
     ```typescript
     import {
       // ... existing imports ...
       <CLIENT_NAME>_LOGO_BASE64,
     } from "./printer-logos";
     ```
   - Add the variant name to the `VariantName` type:
     ```typescript
     export type VariantName =
       | "default"
       | "solflare"
       | "binance"
       | "phantom"
       | "solana"
       | "<client-name>";
     ```
   - Add the variant configuration to the `Variants` object:
     ```typescript
     <client-name>: {
       name: "<Client Name>",
       brandLogo: require("@/assets/images/variants/<client-name>_brand.png"),
       printerLogo: <CLIENT_NAME>_LOGO_BASE64,
       defaultTheme: "light", // or "dark"
       colors: {
         light: {
           "icon-accent-primary": "#HEXCOLOR",
           "bg-accent-primary": "#HEXCOLOR",
           "bg-payment-success": "#HEXCOLOR",
           "text-payment-success": "#HEXCOLOR",
           "border-payment-success": "#HEXCOLOR",
         },
         dark: {
           // Same color keys as light theme
         },
       },
     },
     ```


5. **Update Android version code** in `app.json`
   - Increment `expo.android.versionCode`

6. **Commit, push, and create a release tag (Devin only)**
   ```bash
   git add .
   git commit -m "feat: add <client-name> variant"
   git push origin variant/<client-name>
   git tag variant-<client-name>
   git push origin variant-<client-name>
   ```
   The tag will trigger the release workflow automatically.

7. **Verify the release**
   - Check the build status and Firebase link in the `#system-releases-react-native` Slack channel

**Manual release**: If you need to trigger the release manually instead of using a tag, go to GitHub Actions and run the `release-pos-poc` workflow.