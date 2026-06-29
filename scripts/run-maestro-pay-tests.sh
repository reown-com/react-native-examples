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

# Tags included on a default (no-args) run. Web adds `pay-web` — flows that only
# run in a browser (e.g. the in-app KYC form, which replaces the hosted webview
# on web). Native runs use `pay` only, so they never pick up `pay-web` flows.
INCLUDE_TAGS="pay"

# Web target: a URL App ID (e.g. MAESTRO_APP_ID=http://localhost:8081). Maestro
# web flows must use `url:` instead of `appId:` and run via plain `maestro test`
# (auto-detects web, downloads/launches a managed Chromium). Rewrite the flows
# into a temp copy and point MAESTRO_DIR at it.
# NOTE: serve the web app over HTTP for Maestro — its managed Chromium does not
# trust local mkcert certs (https fails: ERR_CERT_AUTHORITY_INVALID), so the
# https-only IC/KYC callback leg can't complete under local Maestro web.
if [[ "$APP_ID" == http://* || "$APP_ID" == https://* ]]; then
  echo "Web target detected ($APP_ID) — rewriting flows to use 'url:'."
  WEB_FLOWS_DIR="$(mktemp -d)"
  trap 'rm -rf "$WEB_FLOWS_DIR"' EXIT
  cp -R "$MAESTRO_DIR/." "$WEB_FLOWS_DIR/"
  # appId: -> url: so Maestro targets the browser. Also strip startRecording/
  # stopRecording: Maestro's web driver doesn't support screen recording and the
  # command fails the flow (~2s in). Native CI keeps recording (source is intact;
  # we only edit this throwaway copy).
  find "$WEB_FLOWS_DIR" -name '*.yaml' -print0 \
    | xargs -0 perl -ni -e 'next if /^\s*-?\s*(start|stop)Recording\b/; s/^appId:(\s*\$\{APP_ID\})/url:$1/; print'

  # Skip flows that can't run in a browser (mobile-only). We remove them from the
  # throwaway copy rather than tag them, because the flows are downloaded from the
  # actions repo (a tag added here is overwritten on re-download). The durable fix
  # is a `mobile-only` tag upstream + `--exclude-tags mobile-only` here.
  #   - KYC webview flows: the identity-collection form sends X-Frame-Options DENY,
  #     so on web it opens in a NEW TAB (Maestro drives a single tab) and its
  #     callback is HTTPS-only — the form leg can't complete under local web.
  #   - deeplink/universal-link: `openLink` of the wallet's custom scheme/universal
  #     link isn't handled by the web build.
  # KYC-webview flows are replaced on web by in-app-form variants tagged
  # `pay-web` (pay_kyc_web, pay_cancel_from_kyc_web). The multi-option no-KYC
  # flow correlates option->review via the option's accessibilityLabel (network
  # name), which Maestro web can't read; pay_multiple_options_nokyc_web covers
  # the rest. The deeplink flow opens a universal link the web build won't handle.
  WEB_SKIP_FLOWS=(
    pay_kyc_back_navigation.yaml      # asserts KYC webview back/close (mobile-only)
    pay_cancel_from_kyc.yaml          # hosted KYC webview -> see pay_cancel_from_kyc_web
    pay_multiple_options_kyc.yaml     # hosted KYC webview -> see pay_kyc_web
    pay_multiple_options_nokyc.yaml   # aria-label correlation -> see pay_multiple_options_nokyc_web
    pay_single_option_nokyc_deeplink.yaml  # opens a universal link / deeplink
  )
  for flow in "${WEB_SKIP_FLOWS[@]}"; do
    if rm -f "$WEB_FLOWS_DIR/$flow" 2>/dev/null && [ ! -e "$WEB_FLOWS_DIR/$flow" ]; then
      echo "  web-skip: $flow (mobile-only — not runnable in a browser)"
    fi
  done

  MAESTRO_DIR="$WEB_FLOWS_DIR"
  INCLUDE_TAGS="pay,pay-web"
fi

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
  set -- --include-tags "$INCLUDE_TAGS" "$MAESTRO_DIR"
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
