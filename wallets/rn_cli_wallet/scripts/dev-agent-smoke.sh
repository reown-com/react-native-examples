#!/usr/bin/env bash
# Smoke-test the dev agent channel without Maestro, an emulator or a native build.
#
# Point any build with EXPO_PUBLIC_DEV_AGENT=true at the daemon — `yarn web` is
# the fastest — and run this. It exercises the whole command surface, including
# the failure paths, and answers the question the PoC actually hinges on:
# does `query` resolve a testID, and by which strategy?
#
#   node scripts/dev-agent-daemon.js     # terminal 1
#   yarn web                             # terminal 2
#   bash scripts/dev-agent-smoke.sh      # terminal 3
#
# Env: DAEMON (default http://localhost:7789), PROBE_TESTID (default button-scan).
set -uo pipefail

DAEMON="${DAEMON:-http://localhost:7789}"
PROBE_TESTID="${PROBE_TESTID:-button-scan}"

pass=0
fail=0

green() { printf '\033[32m%s\033[0m' "$1"; }
red()   { printf '\033[31m%s\033[0m' "$1"; }
dim()   { printf '\033[2m%s\033[0m' "$1"; }

ok()   { green "  PASS"; echo "  $1"; pass=$((pass + 1)); }
bad()  { red   "  FAIL"; echo "  $1"; fail=$((fail + 1)); }
note() { dim   "        $1"; echo; }

# Reads a dotted path out of a JSON document on stdin. Prints an empty string if
# the path is missing, so callers can test with [ -z ].
jget() {
  node -e '
    let raw = "";
    process.stdin.on("data", d => (raw += d)).on("end", () => {
      try {
        const doc = JSON.parse(raw);
        const value = process.argv[1]
          .split(".")
          .reduce((acc, key) => (acc == null ? acc : acc[key]), doc);
        if (value === undefined || value === null) { console.log(""); return; }
        console.log(typeof value === "object" ? JSON.stringify(value) : String(value));
      } catch { console.log(""); }
    });
  ' "$1"
}

cmd() {
  local name="$1"
  local args="${2:-}"
  # An empty default, filled in below. Deliberately not ${2:-{\}}: that form
  # expands differently on bash 3.2 (what macOS ships), where the backslash
  # survives into the body and every argument-less command becomes invalid JSON.
  if [ -z "$args" ]; then
    args='{}'
  fi

  local res
  res="$(curl -s --max-time 30 -X POST "$DAEMON/cmd" \
    -H 'Content-Type: application/json' \
    -d "{\"cmd\":\"$name\",\"args\":$args}")"

  # This error can only come from the daemon rejecting what this script sent, so
  # report it as a harness bug instead of letting it read like an app failure.
  case "$res" in
    *'body is not valid JSON'*)
      echo "{\"ok\":false,\"error\":\"SMOKE SCRIPT BUG: sent malformed JSON for \\\"$name\\\" (args=$args)\"}"
      return
      ;;
  esac
  printf '%s' "$res"
}

echo "=== dev agent smoke test ==="
echo "daemon: $DAEMON"
echo

# --- 1. the daemon is up and an app is attached ------------------------------
health="$(curl -s --max-time 5 "$DAEMON/health")"
if [ -z "$health" ]; then
  bad "daemon unreachable at $DAEMON"
  note "start it: node scripts/dev-agent-daemon.js"
  exit 1
fi
if [ "$(printf '%s' "$health" | jget connected)" != "true" ]; then
  bad "daemon is up but no app is connected"
  note "build needs EXPO_PUBLIC_DEV_AGENT=true, and the app must be running"
  exit 1
fi
ok "daemon up, app connected"

# --- 2. ping ------------------------------------------------------------------
res="$(cmd ping)"
if [ "$(printf '%s' "$res" | jget ok)" = "true" ]; then
  ok "ping"
  note "platform=$(printf '%s' "$res" | jget result.platform) testMode=$(printf '%s' "$res" | jget result.testMode)"
else
  bad "ping: $(printf '%s' "$res" | jget error)"
fi

# --- 3. state serialises (valtio proxies + ref() survive the round trip) ------
res="$(cmd state)"
step="$(printf '%s' "$res" | jget result.payment.step)"
modal="$(printf '%s' "$res" | jget result.modal)"
if [ "$(printf '%s' "$res" | jget ok)" = "true" ] && [ -n "$step" ] && [ -n "$modal" ]; then
  ok "state serialises"
  note "payment.step=$step modal=$modal"
else
  bad "state did not come back intact: $res"
fi

# --- 4. query: THE check that matters ----------------------------------------
res="$(cmd query "{\"testID\":\"$PROBE_TESTID\"}")"
found="$(printf '%s' "$res" | jget result.found)"
strategy="$(printf '%s' "$res" | jget result.strategy)"
if [ "$found" = "true" ]; then
  ok "query resolved '$PROBE_TESTID' (strategy: $strategy)"
  note "px x=$(printf '%s' "$res" | jget result.x) y=$(printf '%s' "$res" | jget result.y) onScreen=$(printf '%s' "$res" | jget result.onScreen)"
  note "dp $(printf '%s' "$res" | jget result.dp)"
  if [ "$strategy" = "fiber" ]; then
    note "the fiber walk works on this React/RN version — the PoC's main risk is clear"
  else
    note "fell back to the registry: wire targets with useAgentTarget(testID)"
  fi
else
  bad "query could not resolve '$PROBE_TESTID'"
  note "strategy=$strategy error=$(printf '%s' "$res" | jget result.error)"
  note "is that testID on the current screen? try PROBE_TESTID=<other>"
fi

# --- 5. imperative navigation, read back from the nav tree -------------------
before="$(cmd state | jget result.nav.index)"
res="$(cmd navigate '{"screen":"Logs"}')"
if [ "$(printf '%s' "$res" | jget ok)" = "true" ]; then
  nav="$(cmd state)"
  idx="$(printf '%s' "$nav" | jget result.nav.index)"
  route="$(printf '%s' "$nav" | jget "result.nav.routes.$idx.name")"
  if [ "$route" = "Logs" ]; then
    ok "navigate -> Logs (nav tree confirms)"
  else
    bad "navigate returned ok but the nav tree says '$route'"
  fi

  if [ "$(cmd back | jget ok)" = "true" ]; then
    nav="$(cmd state)"
    idx="$(printf '%s' "$nav" | jget result.nav.index)"
    if [ "$idx" = "$before" ]; then
      ok "back returned to the previous route"
    else
      bad "back left the stack at index $idx, expected $before"
    fi
  else
    bad "back failed"
  fi
else
  bad "navigate: $(printf '%s' "$res" | jget error)"
fi

# --- 6. a missing testID is a clean negative, not a crash --------------------
res="$(cmd query '{"testID":"definitely-not-a-real-test-id"}')"
if [ "$(printf '%s' "$res" | jget ok)" = "true" ] && \
   [ "$(printf '%s' "$res" | jget result.found)" = "false" ]; then
  ok "missing testID reports found:false"
else
  bad "missing testID did not degrade cleanly: $res"
fi

# --- 7. an unknown command fails legibly rather than hanging -----------------
res="$(cmd definitely-not-a-command)"
err="$(printf '%s' "$res" | jget error)"
# Must be the app's own rejection: any ok:false would otherwise pass here, which
# is how a transport-level failure once masqueraded as this check succeeding.
case "$err" in
  *'unknown command'*)
    ok "unknown command fails legibly"
    note "$err"
    ;;
  *)
    bad "expected the app to reject the command; got: ${err:-$res}"
    ;;
esac

echo
echo "=== $pass passed, $fail failed ==="
[ "$fail" -eq 0 ] || exit 1
