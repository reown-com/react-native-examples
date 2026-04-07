#!/bin/bash
# Downloads shared WalletConnect Pay Maestro test flows from WalletConnect/actions repo.
# Usage: ./scripts/setup-maestro-pay-tests.sh [branch]
#   branch: actions repo branch/tag to pull from (default: master)

set -euo pipefail

ACTIONS_BRANCH="${1:-master}"
ACTIONS_REPO="WalletConnect/actions"
TARGET_DIR=".maestro"
TMP_DIR=$(mktemp -d)

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Downloading Pay test flows from $ACTIONS_REPO@$ACTIONS_BRANCH..."

# Download and extract the archive
curl -fsSL "https://github.com/$ACTIONS_REPO/archive/refs/heads/$ACTIONS_BRANCH.tar.gz" \
  | tar -xz -C "$TMP_DIR"

# Find the extracted .maestro directory (GitHub replaces / with - in the root dir name)
SRC_DIR=$(find "$TMP_DIR" -type d -path "*/maestro/pay-tests/.maestro" | head -1)

if [ -z "$SRC_DIR" ]; then
  echo "Error: Could not find maestro/pay-tests/.maestro in the archive"
  exit 1
fi

# Copy pay flows (root level)
cp "$SRC_DIR"/pay_*.yaml "$TARGET_DIR/"

# Copy shared sub-flows
mkdir -p "$TARGET_DIR/flows"
cp "$SRC_DIR"/flows/pay_*.yaml "$TARGET_DIR/flows/"

# Copy scripts
mkdir -p "$TARGET_DIR/scripts"
cp "$SRC_DIR"/scripts/*.js "$TARGET_DIR/scripts/"

echo "Pay test flows copied to $TARGET_DIR/"
echo "  $(ls "$TARGET_DIR"/pay_*.yaml | wc -l | tr -d ' ') root flows"
echo "  $(ls "$TARGET_DIR"/flows/pay_*.yaml | wc -l | tr -d ' ') sub-flows"
echo "  $(ls "$TARGET_DIR"/scripts/*.js | wc -l | tr -d ' ') scripts"
