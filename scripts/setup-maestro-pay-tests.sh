#!/bin/bash
# Downloads shared WalletConnect Pay Maestro test flows from WalletConnect/actions repo.
# Usage: ./scripts/setup-maestro-pay-tests.sh [ref]
#   ref: actions repo branch/tag/commit to pull from (default: master)

set -euo pipefail

REF="${1:-master}"
REPO="WalletConnect/actions"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TARGET_DIR="$ROOT_DIR/.maestro"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

count_matches() {
  local dir="$1"
  local pattern="$2"
  find "$dir" -maxdepth 1 -type f -name "$pattern" | wc -l | tr -d ' '
}

echo "Downloading Maestro Pay test flows from $REPO@$REF..."

mkdir -p "$TARGET_DIR" "$TARGET_DIR/flows" "$TARGET_DIR/scripts"

# Remove only managed Pay flow files so unrelated local Maestro files survive.
find "$TARGET_DIR" -maxdepth 1 -type f -name 'pay_*.yaml' -delete
find "$TARGET_DIR/flows" -maxdepth 1 -type f -name 'pay_*.yaml' -delete
find "$TARGET_DIR/scripts" -maxdepth 1 -type f -name '*.js' -delete

# Download and extract the archive. codeload accepts branches, tags, and commit SHAs.
curl -fsSL "https://codeload.github.com/$REPO/tar.gz/$REF" | tar -xz -C "$TMP_DIR"

SRC_DIR="$(find "$TMP_DIR" -type d -path '*/maestro/pay-tests/.maestro' | head -1)"

if [ -z "$SRC_DIR" ]; then
  echo "ERROR: Could not find maestro/pay-tests/.maestro in the archive"
  exit 1
fi

cp "$SRC_DIR"/pay_*.yaml "$TARGET_DIR/"

mkdir -p "$TARGET_DIR/flows"
cp "$SRC_DIR"/flows/pay_*.yaml "$TARGET_DIR/flows/"

mkdir -p "$TARGET_DIR/scripts"
cp "$SRC_DIR"/scripts/*.js "$TARGET_DIR/scripts/"

echo "Pay test flows copied to $TARGET_DIR/"
echo "  $(count_matches "$TARGET_DIR" 'pay_*.yaml') root flows"
echo "  $(count_matches "$TARGET_DIR/flows" 'pay_*.yaml') sub-flows"
echo "  $(count_matches "$TARGET_DIR/scripts" '*.js') scripts"
