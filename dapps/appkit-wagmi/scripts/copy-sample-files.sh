#!/bin/bash
# Script that copies mock files to the correct location (skips if file exists).
#
# Under Continuous Native Generation the android/ dir doesn't exist until
# `expo prebuild` runs, so android secrets are seeded by scripts/setup-secrets.js
# (postprebuild) instead. This postinstall hook only seeds the local .env.

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
