#!/bin/bash
# Android leg of the Maestro Pay suite, run inside android-emulator-runner's
# `script` once the emulator is up and the APK is installed: captures logcat
# around the shared suite runner (maestro-suite.sh) and exits with its code.

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

mkdir -p maestro-artifacts maestro-artifacts/maestro-debug
# Clear every buffer so the captures below only cover this run.
adb logcat -b all -c || true
# Launch diagnostics for the flake where a launch never reaches the app: info-level
# ActivityManager/ActivityTaskManager plus the events buffer (process start/death,
# resumed activity).
adb logcat AndroidRuntime:E ActivityManager:I ActivityTaskManager:I ReactNativeJS:E '*:F' \
  > maestro-artifacts/android-logcat.log 2>&1 &
LOGCAT_PID=$!
adb logcat -b events > maestro-artifacts/android-logcat-events.log 2>&1 &
EVENTS_PID=$!

bash "$SCRIPTS_DIR/maestro-suite.sh" Android
maestro_exit_code=$?

kill "$LOGCAT_PID" "$EVENTS_PID" 2>/dev/null || true
wait "$LOGCAT_PID" "$EVENTS_PID" 2>/dev/null || true
adb logcat -d -b crash > maestro-artifacts/android-logcat-crash.log 2>&1 || true
cp -R "${RUNNER_TEMP}/maestro-debug/." maestro-artifacts/maestro-debug/ 2>/dev/null || true
exit "$maestro_exit_code"
