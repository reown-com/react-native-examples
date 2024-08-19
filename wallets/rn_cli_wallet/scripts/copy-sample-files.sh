//bash script that copies the mock files to the correct location

cp .env.example .env.debug
cp android/app/google-services.mock.json android/app/google-services.json
cp android/app/debug.keystore.mock android/app/debug.keystore
cp android/secrets.properties.mock android/secrets.properties

cp ios/GoogleService/GoogleService-Info.mock.plist ios/GoogleService/GoogleService-Debug-Info.plist
