#!/bin/bash
# Runs Maestro Pay E2E tests with the required environment variables.
# Reads secrets from .env.maestro file (create one from .env.maestro.example).
#
# Usage: ./scripts/run-maestro-pay-tests.sh [maestro-args...]
# Examples:
#   ./scripts/run-maestro-pay-tests.sh                          # Run all pay tests
#   ./scripts/run-maestro-pay-tests.sh --include-tags pay       # Same, explicit tag
#   ./scripts/run-maestro-pay-tests.sh .maestro/pay_cancelled.yaml  # Run single test

set -euo pipefail

MAESTRO_DIR=".maestro"
ENV_FILE=".env.maestro"

# Check that pay test flows exist
if ! ls "$MAESTRO_DIR"/pay_*.yaml &>/dev/null; then
  echo "No pay test flows found in $MAESTRO_DIR/."
  echo "Run: ./scripts/setup-maestro-pay-tests.sh"
  exit 1
fi

# Load secrets from .env.maestro
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — create one from .env.maestro.example:"
  echo "  cp .env.maestro.example .env.maestro"
  echo "  # Then fill in the values"
  exit 1
fi

# Source the env file (supports KEY=VALUE format with comments)
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Validate required vars
REQUIRED_VARS=(
  WPAY_CUSTOMER_KEY_SINGLE_NOKYC
  WPAY_MERCHANT_ID_SINGLE_NOKYC
  WPAY_CUSTOMER_KEY_MULTI_NOKYC
  WPAY_MERCHANT_ID_MULTI_NOKYC
  WPAY_CUSTOMER_KEY_MULTI_KYC
  WPAY_MERCHANT_ID_MULTI_KYC
)

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    MISSING+=("$var")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "Missing required variables in $ENV_FILE:"
  printf '  %s\n' "${MISSING[@]}"
  exit 1
fi

# Default app ID (override with MAESTRO_APP_ID env var)
APP_ID="${MAESTRO_APP_ID:-com.walletconnect.web3wallet.rnsample.internal}"

# Build the maestro command
MAESTRO_ARGS=(
  --env "APP_ID=$APP_ID"
  --env "WPAY_CUSTOMER_KEY_SINGLE_NOKYC=$WPAY_CUSTOMER_KEY_SINGLE_NOKYC"
  --env "WPAY_MERCHANT_ID_SINGLE_NOKYC=$WPAY_MERCHANT_ID_SINGLE_NOKYC"
  --env "WPAY_CUSTOMER_KEY_MULTI_NOKYC=$WPAY_CUSTOMER_KEY_MULTI_NOKYC"
  --env "WPAY_MERCHANT_ID_MULTI_NOKYC=$WPAY_MERCHANT_ID_MULTI_NOKYC"
  --env "WPAY_CUSTOMER_KEY_MULTI_KYC=$WPAY_CUSTOMER_KEY_MULTI_KYC"
  --env "WPAY_MERCHANT_ID_MULTI_KYC=$WPAY_MERCHANT_ID_MULTI_KYC"
)

# If no arguments provided, run all pay-tagged tests
if [ $# -eq 0 ]; then
  set -- --include-tags pay "$MAESTRO_DIR"
fi

echo "Running: maestro test ${MAESTRO_ARGS[*]} $*"
maestro test "${MAESTRO_ARGS[@]}" "$@"
