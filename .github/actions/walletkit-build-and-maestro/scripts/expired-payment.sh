#!/usr/bin/env bash
# Expired-payment pool for pay_expired_link.yaml.
#
# Pay payments expire 15 minutes after creation, and a single hardcoded expired
# link eventually stops resolving as `expired` (it broke in Oct 2026). Instead,
# every run picks a payment an earlier run created (old enough to have expired)
# and seeds a fresh one for later runs. The pool is a TSV of
# "<created-epoch>\t<gateway-url>" lines carried between runs in actions/cache.
# Holding several entries keeps runs that start close together (PR pushes,
# re-runs) from only finding a payment that hasn't expired yet.
#
#   expired-payment.sh <pool-file>
#     -> writes url=<gateway-url> to $GITHUB_OUTPUT (empty when none is old enough)
#     -> appends a newly created payment to <pool-file>
#
# Needs WPAY_CUSTOMER_KEY / WPAY_MERCHANT_ID. Never fails the job: with no pool
# entry the flow falls back to its hardcoded link.
set -uo pipefail

POOL_FILE="$1"
# Comfortably past the 15-minute expiry.
MIN_AGE_SECONDS=$((20 * 60))
MAX_ENTRIES=20
API_URL="https://api.pay.walletconnect.com"

mkdir -p "$(dirname "$POOL_FILE")"
touch "$POOL_FILE"
NOW=$(date +%s)

# Newest entry that is old enough.
URL=$(awk -F'\t' -v now="$NOW" -v min="$MIN_AGE_SECONDS" \
  'NF == 2 && now - $1 >= min { url = $2 } END { print url }' "$POOL_FILE")
if [ -n "$URL" ]; then
  echo "Using pooled expired payment: $URL"
else
  echo "::warning::No pooled payment older than $((MIN_AGE_SECONDS / 60))m; pay_expired_link falls back to its hardcoded link."
fi
echo "url=$URL" >> "$GITHUB_OUTPUT"

RESPONSE=$(curl -fsS --retry 3 --retry-all-errors --max-time 20 \
  -X POST "$API_URL/v1/payments" \
  -H 'Content-Type: application/json' \
  -H "Api-Key: $WPAY_CUSTOMER_KEY" \
  -H "Merchant-Id: $WPAY_MERCHANT_ID" \
  -d "{\"referenceId\":\"e2e-expired-$NOW-$RANDOM\",\"amount\":{\"value\":\"1\",\"unit\":\"iso4217/USD\"}}") || {
  echo "::warning::Could not create a payment for the expired-payment pool."
  exit 0
}
NEW_URL=$(jq -r '.gatewayUrl // empty' <<< "$RESPONSE")
if [ -z "$NEW_URL" ]; then
  echo "::warning::No gatewayUrl in create-payment response; pool not seeded."
  exit 0
fi

printf '%s\t%s\n' "$NOW" "$NEW_URL" >> "$POOL_FILE"
tail -n "$MAX_ENTRIES" "$POOL_FILE" > "$POOL_FILE.tmp" && mv "$POOL_FILE.tmp" "$POOL_FILE"
echo "Seeded pool with $NEW_URL ($(wc -l < "$POOL_FILE" | tr -d ' ') entries)"
