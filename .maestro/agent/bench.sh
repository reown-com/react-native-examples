#!/usr/bin/env bash
# Phase 0 — is Maestro's per-command hierarchy dump actually the bottleneck?
#
# Runs three arms N times each and reports median wall clock:
#   baseline  prelude only (clearState + cold start + first assert)
#   maestro   baseline + 20x assertVisible
#   socket    baseline + 20x query over the dev agent
#
# Per-command cost = (arm - baseline) / 20. Subtracting the baseline is the
# point: cold start varies far more than the thing being measured, so comparing
# raw totals would mostly measure the emulator's mood.
#
# The PoC is only worth building out if (maestro - socket) is material at the
# scale of a real suite: 11 flows x ~20 commands.
set -uo pipefail

RUNS="${RUNS:-3}"
APP_ID="${APP_ID:-com.walletconnect.web3wallet.rnsample.internal}"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="${OUT:-$ROOT/bench-results}"

mkdir -p "$OUT"
cd "$ROOT"

if [ ! -x "$MAESTRO" ] && ! command -v maestro >/dev/null 2>&1; then
  echo "maestro not found. Install it or set MAESTRO=/path/to/maestro." >&2
  exit 1
fi
[ -x "$MAESTRO" ] || MAESTRO="$(command -v maestro)"

if ! curl -fsS localhost:7789/health | grep -q '"connected":true'; then
  echo "dev agent is not connected. Start the daemon and a build with" >&2
  echo "EXPO_PUBLIC_DEV_AGENT=true before benchmarking." >&2
  exit 1
fi

# macOS `date` has no %N (it is a GNU extension), so `date +%s%N` yields a
# literal "N" there and the arithmetic below silently produces garbage. node is
# already a hard requirement of this repo, so use it for a portable millisecond
# clock. Its startup cost is identical across arms and cancels in the
# baseline subtraction.
now_ms() { node -p 'Date.now()'; }

run_arm() {
  local name="$1" flow="$2"
  # A newline-separated string rather than an array: bash 3.2 (macOS) errors on
  # expanding an empty array under `set -u`, which is exactly what happens when
  # every run of an arm fails.
  local times=""
  for i in $(seq 1 "$RUNS"); do
    local start end status
    start=$(now_ms)
    "$MAESTRO" test --env APP_ID="$APP_ID" "$flow" \
      > "$OUT/${name}-${i}.log" 2>&1
    status=$?
    end=$(now_ms)
    if [ $status -ne 0 ]; then
      echo "  run $i FAILED (see $OUT/${name}-${i}.log)" >&2
      continue
    fi
    local ms=$(( end - start ))
    times="${times}${ms}
"
    echo "  run $i: ${ms}ms"
  done
  printf '%s' "$times" | grep -v '^$' | sort -n | awk '
    { v[NR]=$1 }
    END {
      if (NR == 0) { print "NA"; exit }
      print (NR % 2) ? v[(NR+1)/2] : int((v[NR/2] + v[NR/2+1]) / 2)
    }'
}

echo "=== Phase 0 benchmark (${RUNS} runs per arm) ==="
echo
echo "baseline (prelude only):"
BASE=$(run_arm baseline .maestro/agent_bench_baseline.yaml)
echo
echo "maestro (20x assertVisible):"
MAES=$(run_arm maestro .maestro/agent_bench_maestro.yaml)
echo
echo "socket (20x query):"
SOCK=$(run_arm socket .maestro/agent_bench_socket.yaml)
echo

python3 - "$BASE" "$MAES" "$SOCK" <<'PY'
import sys
base, maes, sock = sys.argv[1:4]
if "NA" in (base, maes, sock):
    print("Not enough successful runs to report. Check the logs.")
    raise SystemExit(1)
base, maes, sock = int(base), int(maes), int(sock)
n = 20
m_cmd = (maes - base) / n
s_cmd = (sock - base) / n
print(f"median baseline        {base:>7} ms")
print(f"median maestro arm     {maes:>7} ms   -> {m_cmd:7.1f} ms/command")
print(f"median socket  arm     {sock:>7} ms   -> {s_cmd:7.1f} ms/command")
print()
if m_cmd <= 0 or s_cmd < 0:
    print("Arm came in at or below baseline: noise is larger than the effect.")
    print("Raise RUNS, or the per-command cost is too small to matter here.")
    raise SystemExit(0)
print(f"per-command delta      {m_cmd - s_cmd:7.1f} ms")
# 11 pay flows, order-of-20 addressable commands each.
saving = (m_cmd - s_cmd) * n * 11 / 1000
print(f"extrapolated to 11 flows x {n} commands: {saving:.1f} s per suite run")
print()
print("Judgement: this is worth building out only if that number is material")
print("against a suite that already runs 30-55 min. If it is not, the")
print("bottleneck is elsewhere (cold start, on-chain settlement) and the")
print("prelude shortcut alone is the part worth keeping.")
PY
