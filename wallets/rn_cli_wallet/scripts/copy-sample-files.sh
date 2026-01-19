#!/bin/zsh
# Script that copies mock files to the correct location (skips if file exists)

copy_if_missing() {
    local src="$1"
    local dest="$2"
    if [ ! -f "$dest" ]; then
        cp "$src" "$dest"
        echo "Copied: $dest"
    else
        echo "Skipped (exists): $dest"
    fi
}

copy_if_missing .env.example .env
copy_if_missing android/app/google-services.mock.json android/app/google-services.json
copy_if_missing android/app/debug.keystore.mock android/app/debug.keystore
copy_if_missing android/secrets.properties.mock android/secrets.properties
copy_if_missing ios/GoogleService/GoogleService-Info.mock.plist ios/GoogleService/GoogleService-Debug-Info.plist
