#!/bin/bash
# Runs the tagged Maestro Pay suite with one retry that re-runs only the flows
# that failed. Shared by the iOS and Android legs.
#
# Usage: maestro-suite.sh <label>
# Env:
#   MAESTRO_TAGS, MAESTRO_EXCLUDE_TAGS  tag filters for the first attempt
#   MAESTRO_DEVICES   optional comma-separated device IDs; more than one splits
#                     the flows across them (`--shard-split`)
#   APP_ID, DEEPLINK_PREFIX, WPAY_*     passed to the flows as --env
# Writes maestro-output-attempt-<n>.log (streamed live), maestro-output.log and
# maestro-artifacts/junit-attempt-<n>.xml. Exits with Maestro's exit code.

LABEL="${1:?usage: maestro-suite.sh <label>}"

DEVICE_ARGS=()
DEVICE_COUNT=1
if [ -n "${MAESTRO_DEVICES:-}" ]; then
  IFS=, read -ra DEVICES <<< "$MAESTRO_DEVICES"
  DEVICE_ARGS=(--device "$MAESTRO_DEVICES")
  DEVICE_COUNT=${#DEVICES[@]}
fi

# Attempt 1 runs the tagged suite; the retry runs only the flows that failed.
FLOW_ARGS=(.maestro/)
TAG_ARGS=(--include-tags "$MAESTRO_TAGS" ${MAESTRO_EXCLUDE_TAGS:+--exclude-tags "$MAESTRO_EXCLUDE_TAGS"})

mkdir -p maestro-artifacts
# Clear stale per-attempt output (the composite may be invoked twice per job).
rm -f maestro-output-attempt-*.log maestro-artifacts/junit-attempt-*.xml

# Retry failed flows once to absorb transient cold-start flakes (e.g. an app
# process that fails to launch/attach) without rebuilding the app or rebooting
# the devices. A genuine failure fails every attempt, so this doesn't mask
# regressions.
maestro_exit_code=0
for attempt in 1 2; do
  echo "=== Maestro attempt $attempt/2 ($LABEL) ==="
  # Split across the devices, but never into more shards than flows.
  SHARDS=$DEVICE_COUNT
  if [ "$attempt" -gt 1 ] && [ "${#FLOW_ARGS[@]}" -lt "$SHARDS" ]; then SHARDS=${#FLOW_ARGS[@]}; fi
  SHARD_ARGS=()
  [ "$DEVICE_COUNT" -gt 1 ] && SHARD_ARGS=(--shard-split "$SHARDS")
  JUNIT="maestro-artifacts/junit-attempt-${attempt}.xml"
  "$HOME/.maestro/bin/maestro" "${DEVICE_ARGS[@]}" test "${SHARD_ARGS[@]}" \
    --env APP_ID="$APP_ID" \
    --env DEEPLINK_PREFIX="$DEEPLINK_PREFIX" \
    --env WPAY_CUSTOMER_KEY_SINGLE_NOKYC="$WPAY_CUSTOMER_KEY_SINGLE_NOKYC" \
    --env WPAY_MERCHANT_ID_SINGLE_NOKYC="$WPAY_MERCHANT_ID_SINGLE_NOKYC" \
    --env WPAY_CUSTOMER_KEY_MULTI_NOKYC="$WPAY_CUSTOMER_KEY_MULTI_NOKYC" \
    --env WPAY_MERCHANT_ID_MULTI_NOKYC="$WPAY_MERCHANT_ID_MULTI_NOKYC" \
    --env WPAY_CUSTOMER_KEY_MULTI_KYC="$WPAY_CUSTOMER_KEY_MULTI_KYC" \
    --env WPAY_MERCHANT_ID_MULTI_KYC="$WPAY_MERCHANT_ID_MULTI_KYC" \
    --env WPAY_PAY_API_URL="$WPAY_PAY_API_URL" \
    --env WPAY_EXPIRED_GATEWAY_URL="$WPAY_EXPIRED_GATEWAY_URL" \
    "${TAG_ARGS[@]}" \
    --format junit --output "$JUNIT" \
    --test-output-dir maestro-artifacts \
    --debug-output "${RUNNER_TEMP}/maestro-debug" \
    "${FLOW_ARGS[@]}" 2>&1 | tee "maestro-output-attempt-${attempt}.log"
  # Streamed live (tee) so a hung run still shows its progress in the log.
  maestro_exit_code=${PIPESTATUS[0]}
  [ "$maestro_exit_code" -eq 0 ] && break
  # >128 means killed by a signal (e.g. workflow cancel) — don't retry.
  if [ "$maestro_exit_code" -gt 128 ]; then
    echo "Maestro killed by signal (exit $maestro_exit_code) — not retrying"
    break
  fi
  echo "Maestro attempt $attempt failed (exit $maestro_exit_code)"
  # The JUnit report covers every shard and names each flow's file; the console
  # output interleaves shards, so don't parse that.
  # Take each whole <testcase ...> opening tag (failed ones have a <failure>
  # child, so they aren't self-closing), then read `file` wherever it sits in
  # the attribute list. Only existing flow files count.
  FAILED=()
  if [ -f "$JUNIT" ]; then
    while IFS= read -r f; do [ -f "$f" ] && FAILED+=("$f"); done < <(
      grep -oE '<testcase [^>]*>' "$JUNIT" |
        grep -v 'status="SUCCESS"' |
        grep -oE ' file="[^"]*"' | sed -E 's/^ file="(.*)"$/\1/')
  fi
  if [ "$attempt" -eq 2 ]; then
    echo "$LABEL Maestro still failing after the retry: ${FAILED[*]:-see maestro-output.log}" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  elif [ "${#FAILED[@]}" -gt 0 ]; then
    echo "Retrying only the ${#FAILED[@]} failed flow(s): ${FAILED[*]}"
    echo "$LABEL Maestro attempt 1 failed: ${FAILED[*]}; retrying only those" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
    FLOW_ARGS=("${FAILED[@]}")
    # The failed-flow list is already tag-filtered.
    TAG_ARGS=()
  else
    echo "No per-flow results in $JUNIT; retrying the full suite"
  fi
done

# Join per-attempt logs so the uploaded artifact keeps attempt 1's output on a
# double failure (otherwise attempt 2 would have overwritten it).
for f in maestro-output-attempt-*.log; do echo "=== $f ==="; cat "$f"; done > maestro-output.log
exit "$maestro_exit_code"
