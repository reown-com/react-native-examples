#!/bin/bash
# Sets (or rotates) the per-platform WalletKit E2E test wallets: the
# TEST_WALLET_MNEMONIC secret plus the TEST_WALLET_ADDRESS_{ANDROID,IOS,WEB}
# repo variables that .github/actions/derive-e2e-wallet checks against.
# Everything is validated before anything is set, and the phrase is never
# printed or passed on a command line.
#
# Usage:
#   ./scripts/set-e2e-wallets.sh --generate <file>   # new mnemonic into <file>, then set
#   ./scripts/set-e2e-wallets.sh <file>              # use an existing mnemonic file
#   REPO=owner/name ./scripts/set-e2e-wallets.sh <file>
#
# Requires cast (Foundry), gh (authenticated) and jq.

set -euo pipefail

REPO="${REPO:-reown-com/react-native-examples}"
# Account index = position (m/44'/60'/0'/0/<index>); must match ci_e2e_walletkit.yaml.
PLATFORMS=(ANDROID IOS WEB)

usage() {
  sed -n '9,11p' "$0" | sed 's/^# //'
  exit 1
}

for cmd in cast gh jq; do
  command -v "$cmd" >/dev/null || { echo "Missing required command: $cmd"; exit 1; }
done

[ $# -ge 1 ] || usage
if [ "$1" = "--generate" ]; then
  [ $# -eq 2 ] || usage
  FILE="$2"
  if [ -e "$FILE" ]; then
    echo "$FILE already exists; refusing to overwrite it."
    exit 1
  fi
  (umask 077; cast wallet new-mnemonic --json | jq -r '.mnemonic' > "$FILE")
  echo "Wrote a new mnemonic to $FILE."
  echo "Save it in 1Password now: it's the only copy, and it controls the funded wallets."
  read -r -p "Saved? [y/N] " SAVED
  [ "$SAVED" = "y" ] || { echo "Aborted. The mnemonic is still in $FILE."; exit 1; }
else
  [ $# -eq 1 ] || usage
  FILE="$1"
fi

[ -f "$FILE" ] || { echo "No such file: $FILE"; exit 1; }

# Normalize whitespace into a private temp file, used for both cast and gh.
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
tr -s '[:space:]' ' ' < "$FILE" | sed 's/^ //; s/ $//' > "$TMP"

WORD_COUNT="$(wc -w < "$TMP" | tr -d ' ')"
case "$WORD_COUNT" in
  12|15|18|21|24) ;;
  *) echo "$FILE doesn't look like a mnemonic ($WORD_COUNT words; expected 12 or 24)."; exit 1 ;;
esac
if ! grep -qE '^[a-z]+( [a-z]+)*$' "$TMP"; then
  echo "$FILE doesn't look like a mnemonic (expected lowercase words only)."
  exit 1
fi

# cast rejects unknown words and bad checksums here, before anything is set.
# Its error echoes the phrase, so print our own instead.
ADDRESSES=()
for i in "${!PLATFORMS[@]}"; do
  if ! ADDRESS="$(cast wallet address --mnemonic "$TMP" --mnemonic-derivation-path "m/44'/60'/0'/0/$i" 2>/dev/null)"; then
    echo "$FILE is not a valid BIP-39 mnemonic (unknown word or bad checksum)."
    exit 1
  fi
  ADDRESSES+=("$ADDRESS")
done

echo
echo "Derived E2E wallets:"
for i in "${!PLATFORMS[@]}"; do
  printf '  %-8s m/44'"'"'/60'"'"'/0'"'"'/0/%s  %s\n' "${PLATFORMS[$i]}" "$i" "${ADDRESSES[$i]}"
done
echo
read -r -p "Set TEST_WALLET_MNEMONIC and TEST_WALLET_ADDRESS_* on $REPO? [y/N] " CONFIRM
[ "$CONFIRM" = "y" ] || { echo "Aborted; nothing was set."; exit 1; }

gh secret set TEST_WALLET_MNEMONIC -R "$REPO" < "$TMP"
for i in "${!PLATFORMS[@]}"; do
  gh variable set "TEST_WALLET_ADDRESS_${PLATFORMS[$i]}" -R "$REPO" --body "${ADDRESSES[$i]}"
done

echo
echo "Done. Fund each address before the next E2E run. Keep every token balance"
echo "under \$9.99 (pay_insufficient_funds relies on it); no ETH is needed on Base/Optimism:"
echo "  Base USDC, Optimism USDC, Polygon USDT, and POL for Polygon gas."
if [ "$1" = "--generate" ]; then
  echo "Once it's in 1Password, delete the local copy: rm $FILE"
fi
