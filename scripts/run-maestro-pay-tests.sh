#!/bin/bash
# Runs Maestro Pay E2E tests with the required environment variables.
# Reads secrets from .env.maestro file (create one from .env.maestro.example).
#
# Usage: ./scripts/run-maestro-pay-tests.sh [maestro-args...]
# Examples:
#   ./scripts/run-maestro-pay-tests.sh
#   ./scripts/run-maestro-pay-tests.sh .maestro/pay_cancelled.yaml
#   ./scripts/run-maestro-pay-tests.sh pay_cancelled.yaml
#   ACTIONS_BRANCH=feat/my-branch ./scripts/run-maestro-pay-tests.sh
#   ./scripts/run-maestro-pay-tests.sh --device <sim-udid> .maestro/pay_expired_link.yaml

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MAESTRO_DIR="$ROOT_DIR/.maestro"
ENV_FILE="$ROOT_DIR/.env.maestro"

resolve_maestro_path() {
  local value="$1"

  if [ -f "$value" ] || [ -d "$value" ]; then
    printf '%s\n' "$value"
    return 0
  fi

  if [ -f "$ROOT_DIR/$value" ] || [ -d "$ROOT_DIR/$value" ]; then
    printf '%s\n' "$ROOT_DIR/$value"
    return 0
  fi

  if [ -f "$MAESTRO_DIR/$value" ] || [ -d "$MAESTRO_DIR/$value" ]; then
    printf '%s\n' "$MAESTRO_DIR/$value"
    return 0
  fi

  return 1
}

# Download pay test flows if not present.
if ! ls "$MAESTRO_DIR"/pay_*.yaml >/dev/null 2>&1; then
  echo "Pay test flows not found. Downloading..."
  "$SCRIPT_DIR/setup-maestro-pay-tests.sh" "${ACTIONS_BRANCH:-master}"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create one from .env.maestro.example:"
  echo "  cp .env.maestro.example .env.maestro"
  echo "  # Then fill in the values"
  exit 1
fi

echo "Loading credentials from $ENV_FILE"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

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

APP_ID="${MAESTRO_APP_ID:-${APP_ID:-com.walletconnect.web3wallet.rnsample.internal}}"

MAESTRO_ARGS=(
  --env "APP_ID=$APP_ID"
  --env "WPAY_CUSTOMER_KEY_SINGLE_NOKYC=$WPAY_CUSTOMER_KEY_SINGLE_NOKYC"
  --env "WPAY_MERCHANT_ID_SINGLE_NOKYC=$WPAY_MERCHANT_ID_SINGLE_NOKYC"
  --env "WPAY_CUSTOMER_KEY_MULTI_NOKYC=$WPAY_CUSTOMER_KEY_MULTI_NOKYC"
  --env "WPAY_MERCHANT_ID_MULTI_NOKYC=$WPAY_MERCHANT_ID_MULTI_NOKYC"
  --env "WPAY_CUSTOMER_KEY_MULTI_KYC=$WPAY_CUSTOMER_KEY_MULTI_KYC"
  --env "WPAY_MERCHANT_ID_MULTI_KYC=$WPAY_MERCHANT_ID_MULTI_KYC"
)

if [ $# -eq 0 ]; then
  set -- --include-tags pay "$MAESTRO_DIR"
fi

RESOLVED_ARGS=()
for arg in "$@"; do
  if [[ "$arg" == -* ]]; then
    RESOLVED_ARGS+=("$arg")
  elif resolved_path="$(resolve_maestro_path "$arg")"; then
    RESOLVED_ARGS+=("$resolved_path")
  else
    RESOLVED_ARGS+=("$arg")
  fi
done

echo "Running Maestro Pay E2E tests..."
echo "  App ID: $APP_ID"
echo "  Args: ${RESOLVED_ARGS[*]}"

maestro test "${MAESTRO_ARGS[@]}" "${RESOLVED_ARGS[@]}"
