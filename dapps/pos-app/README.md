# Welcome to POS Sample app

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

## App Variants

This app supports building different variants using environment configuration files. This is useful for maintaining multiple versions of the app (e.g., production, staging, or different client configurations).

### Available Variants

- **Default**: Uses `.env.default` configuration
- **Variant**: Uses `.env.variant` configuration

### Setting Up Variants

1. Create your variant environment files:

   ```bash
   cp .env .env.default
   cp .env .env.variant
   ```

2. Update each environment file with the appropriate configuration values for that variant.

### Building Variants

To build a specific variant for Android:

**Default variant:**
```bash
npm run android:build:default
```

**Variant build:**
```bash
npm run android:build:variant
```

> **Note**: Each build command will temporarily copy the corresponding `.env.*` file to `.env` before building.

## Production Releases

For production Android releases, you'll need the actual `secrets.properties` file and keystore. Get these from the mobile team or 1Password.

> **⚠️ Security Note**: Never commit `secrets.properties` or keystore files to version control.