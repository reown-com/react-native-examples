#!/bin/zsh

# Setup script for Conductor workspaces
# Creates symlinks for environment files and sentry.properties from the main repo
# This script runs inside the workspace directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Source directory (main repo root via Conductor, or fallback to hardcoded path)
SOURCE_DIR="${CONDUCTOR_ROOT_PATH:-$HOME/projects/react-native-examples}"

echo "Setting up workspace..."
echo "  Source: $SOURCE_DIR"
echo "  Workspace: $(pwd)"
echo ""

# Function to symlink a file if source exists
symlink_file() {
    local src="$1"
    local dest="$2"

    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$dest")"
        ln -sf "$src" "$dest"
        echo -e "${GREEN}✓${NC} Linked: $dest"
    else
        echo -e "${YELLOW}⚠${NC} Not found (skipping): $src"
    fi
}

# Projects to setup
PROJECTS=(
    "dapps/poc-pos-app"
    "dapps/pos-app"
    "dapps/W3MWagmi"
    "wallets/rn_cli_wallet"
)

# Symlink env files
echo "Linking environment files..."
for project in "${PROJECTS[@]}"; do
    symlink_file "$SOURCE_DIR/$project/.env" "$project/.env"
    symlink_file "$SOURCE_DIR/$project/.env.local" "$project/.env.local"
done
echo ""

# Symlink sentry.properties files
echo "Linking sentry.properties files..."
for project in "${PROJECTS[@]}"; do
    symlink_file "$SOURCE_DIR/$project/ios/sentry.properties" "$project/ios/sentry.properties"
    symlink_file "$SOURCE_DIR/$project/android/sentry.properties" "$project/android/sentry.properties"
done
echo ""

# Run copy-sample-files.sh for projects that have it
echo "Running copy-sample-files scripts..."
for project in "dapps/poc-pos-app" "dapps/pos-app" "dapps/W3MWagmi" "wallets/rn_cli_wallet"; do
    if [ -f "$project/scripts/copy-sample-files.sh" ]; then
        echo "Running $project/scripts/copy-sample-files.sh"
        (cd "$project" && zsh scripts/copy-sample-files.sh)
    fi
done
echo ""

echo -e "${GREEN}Workspace setup complete!${NC}"
