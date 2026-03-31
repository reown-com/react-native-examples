#!/usr/bin/env bash
set -euo pipefail

# Creates a WalletConnect Pay payment via the API and outputs the gateway URL.
# Required env vars: WPAY_CUSTOMER_KEY, WPAY_MERCHANT_ID

API_URL="https://api.pay.walletconnect.com/v1/payments"

: "${WPAY_CUSTOMER_KEY:?WPAY_CUSTOMER_KEY is required}"
: "${WPAY_MERCHANT_ID:?WPAY_MERCHANT_ID is required}"

REFERENCE_ID=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid)

HTTP_CODE=$(curl -s -o /tmp/payment_response.json -w "%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Api-Key: ${WPAY_CUSTOMER_KEY}" \
  -H "Merchant-Id: ${WPAY_MERCHANT_ID}" \
  -d "{\"referenceId\":\"${REFERENCE_ID}\",\"amount\":{\"value\":\"1\",\"unit\":\"iso4217/USD\"}}")

RESPONSE=$(cat /tmp/payment_response.json)

if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "Error: API returned HTTP $HTTP_CODE" >&2
  echo "Response: $RESPONSE" >&2
  exit 1
fi

GATEWAY_URL=$(echo "$RESPONSE" | jq -r '.gatewayUrl')
PAYMENT_ID=$(echo "$RESPONSE" | jq -r '.paymentId')

if [ -z "$GATEWAY_URL" ] || [ "$GATEWAY_URL" = "null" ]; then
  echo "Error: Failed to get gatewayUrl from API response" >&2
  echo "Response: $RESPONSE" >&2
  exit 1
fi

echo "gateway_url=$GATEWAY_URL"
echo "payment_id=$PAYMENT_ID"

# Output for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "gateway_url=${GATEWAY_URL}" >> "$GITHUB_OUTPUT"
  echo "payment_id=${PAYMENT_ID}" >> "$GITHUB_OUTPUT"
fi
