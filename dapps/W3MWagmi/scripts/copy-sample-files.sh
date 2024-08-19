//bash script that copies the mock files to the correct location

cp .env.example .env.debug
cp android/app/debug.keystore.mock android/app/debug.keystore
cp android/secrets.properties.mock android/secrets.properties
