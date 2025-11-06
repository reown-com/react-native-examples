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

## Production Releases

For production Android releases, you'll need the actual `secrets.properties` file and keystore. Get these from the mobile team or 1Password.

> **⚠️ Security Note**: Never commit `secrets.properties` or keystore files to version control.