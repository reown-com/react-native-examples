#!/bin/zsh
# Script that copies mock files to the correct location (skips if file exists)

copy_if_missing() {
    local src="$1"
    local dest="$2"
    if [ ! -f "$src" ]; then
        echo "Skipped (source not found): $src"
        return
    fi
    if [ -f "$dest" ]; then
        echo "Skipped (exists): $dest"
        return
    fi
    cp "$src" "$dest"
    echo "Copied: $dest"
}

copy_if_missing .env.example .env
copy_if_missing android/app/debug.keystore.mock android/app/debug.keystore
copy_if_missing android/secrets.properties.mock android/secrets.properties
