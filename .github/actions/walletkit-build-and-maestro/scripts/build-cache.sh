#!/usr/bin/env bash
# Encrypted E2E build cache helper for walletkit-build-and-maestro.
#
# The wallet build inlines EXPO_PUBLIC_TEST_PRIVATE_KEY into the JS bundle, and
# on this public repo any fork PR's workflow can restore caches saved on main.
# So the cached build is always encrypted with BUILD_CACHE_PASSPHRASE (a repo
# secret fork PRs never receive) before it reaches actions/cache.
#
#   build-cache.sh key                       -> writes enabled/key to $GITHUB_OUTPUT
#   build-cache.sh pack   <src-dir> <file>   -> tar + gpg-encrypt <src-dir> into <file>
#   build-cache.sh unpack <file> <dest-dir> <expected-relpath-glob>
#                                            -> decrypt + extract into <dest-dir>, atomically
#
# `unpack` runs only on an exact cache hit and fails closed: the key embeds a
# fingerprint of the passphrase, so a decrypt/extract failure means the entry is
# corrupt (cache entries are immutable) — silently rebuilding would repeat on
# every run without ever replacing it.
set -euo pipefail

# Bump to invalidate every entry (e.g. after a corrupt save).
BUILD_CACHE_EPOCH=v1

die() {
  echo "::error::$*" >&2
  exit 1
}

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | cut -d' ' -f1
  else
    shasum -a 256 | cut -d' ' -f1
  fi
}

# gpg with a throwaway home: never touches the runner's keyrings, and the
# passphrase is fed through fd 3 (never argv) with symkey caching off.
run_gpg() {
  local gpg_home
  gpg_home="$(mktemp -d "${RUNNER_TEMP:-/tmp}/gpg.XXXXXX")"
  local status=0
  gpg --homedir "$gpg_home" --batch --yes --quiet --no-symkey-cache \
    --pinentry-mode loopback --passphrase-fd 3 "$@" \
    3< <(printf '%s' "$BUILD_CACHE_PASSPHRASE") || status=$?
  gpgconf --homedir "$gpg_home" --kill gpg-agent >/dev/null 2>&1 || true
  rm -rf "$gpg_home"
  return "$status"
}

cmd_key() {
  : "${GITHUB_OUTPUT:?}"
  local reason=""
  if [ -z "${BUILD_CACHE_PASSPHRASE:-}" ]; then
    reason="no build-cache-passphrase"
  elif [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "ios" ]; then
    reason="not supported for platform '$PLATFORM' yet"
  elif [ "$PLATFORM" = "ios" ] && [ "${IOS_SIGNING:-false}" = "true" ]; then
    # Signed builds depend on match/ASC state the key can't see.
    reason="signed iOS builds are never cached"
  elif ! git -C "$SOURCE_DIR" rev-parse --verify -q HEAD >/dev/null; then
    reason="'$SOURCE_DIR' is not a git checkout"
  elif [ -n "$(git -C "$SOURCE_DIR" status --porcelain -- wallets/rn_cli_wallet fastlane Gemfile Gemfile.lock)" ]; then
    # The key trusts the committed trees; local edits would be invisible to it.
    reason="build inputs have uncommitted changes"
  fi
  if [ -n "$reason" ]; then
    echo "Build cache disabled: $reason"
    echo "Build cache: disabled ($reason)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
    echo "enabled=false" >> "$GITHUB_OUTPUT"
    return 0
  fi

  local wallet_tree action_digest env_digest week
  wallet_tree="$(git -C "$SOURCE_DIR" rev-parse HEAD:wallets/rn_cli_wallet)"
  # This action's build steps and this helper (cached-payload schema).
  action_digest="$(cat "$GITHUB_ACTION_PATH/action.yml" "$GITHUB_ACTION_PATH"/scripts/* | sha256)"
  # EXPO_PUBLIC_* values are inlined into the bundle at build time.
  env_digest="$(sha256 < "$WALLET_ROOT/.env")"
  # Forced rebuild twice a week (Mon-Wed / Thu-Sun): catches runner/toolchain
  # drift, and keeps the Gradle/Pods/RNRepo caches the build restores
  # (release builds share them) well inside GitHub's 7-days-unused eviction.
  week="$(date -u +%G-W%V)-$([ "$(date -u +%u)" -le 3 ] && echo a || echo b)"

  # Public components are echoed for debugging; secret-derived ones are not.
  local public_inputs
  public_inputs="$(printf '%s\n' \
    "platform=$PLATFORM" \
    "runner=${RUNNER_OS:-}-${RUNNER_ARCH:-}" \
    "wallet_tree=$wallet_tree" \
    "action=$action_digest")"
  if [ "$PLATFORM" = "android" ]; then
    public_inputs+=$'\n'"android_keystore_name=${ANDROID_KEYSTORE_NAME:-}"
  else
    # The root Fastfile/Gemfile drive the simulator build; the selected Xcode
    # (and its SDK) compiles it.
    public_inputs+=$'\n'"fastlane=$(git -C "$SOURCE_DIR" rev-parse HEAD:fastlane)"
    public_inputs+=$'\n'"gemfile=$(git -C "$SOURCE_DIR" rev-parse HEAD:Gemfile)"
    public_inputs+=$'\n'"gemfile_lock=$(git -C "$SOURCE_DIR" rev-parse HEAD:Gemfile.lock)"
    public_inputs+=$'\n'"xcode=$(xcodebuild -version | tr '\n' ' ')"
  fi
  echo "Build cache inputs:"
  echo "$public_inputs" | sed 's/^/  /'

  local digest
  digest="$({
    echo "$public_inputs"
    echo "env=$env_digest"
    # Rotating the passphrase changes the key (clean miss) instead of hitting an
    # immutable entry that can no longer be decrypted.
    echo "passphrase=$(printf '%s' "$BUILD_CACHE_PASSPHRASE" | sha256)"
    if [ "$PLATFORM" = "android" ]; then
      echo "android_secrets=$(printf '%s' "${ANDROID_SECRETS_FILE:-}" | sha256)"
      echo "android_keystore=$(printf '%s' "${ANDROID_KEYSTORE_BASE64:-}" | sha256)"
    fi
  } | sha256)"

  local key="e2e-build-${BUILD_CACHE_EPOCH}-${PLATFORM}-${week}-${digest}"
  echo "Build cache key: $key"
  echo "enabled=true" >> "$GITHUB_OUTPUT"
  echo "key=$key" >> "$GITHUB_OUTPUT"
}

cmd_pack() {
  local src="$1" out="$2"
  [ -d "$src" ] || die "build cache pack: '$src' does not exist"
  mkdir -p "$(dirname "$out")"
  rm -f "$out" "$out.partial"
  # Write aside and rename, so a failed pack never leaves a truncated blob
  # where the save step would pick it up.
  # COPYFILE_DISABLE: macOS tar would otherwise add AppleDouble ._* files
  # (xattrs) inside the .app bundle.
  COPYFILE_DISABLE=1 tar -C "$src" -cf - . | run_gpg --symmetric --cipher-algo AES256 --output "$out.partial"
  mv "$out.partial" "$out"
  echo "Packed $src -> $out ($(du -h "$out" | cut -f1))"
}

cmd_unpack() {
  local in="$1" dest="$2" expected="$3"
  local tmp
  tmp="$(mktemp -d "${RUNNER_TEMP:-/tmp}/e2e-build-unpack.XXXXXX")"
  # shellcheck disable=SC2064
  trap "rm -rf '$tmp'" EXIT

  local hint="Delete it (gh cache delete <key>) or bump BUILD_CACHE_EPOCH in $0."
  [ -s "$in" ] || die "Build cache hit but '$in' is missing or empty. $hint"
  # Decrypt to a file first: gpg's integrity check only fails at the end of
  # the stream, so never pipe unauthenticated plaintext into tar.
  run_gpg --decrypt --output "$tmp/build.tar" "$in" ||
    die "Build cache entry failed to decrypt/authenticate (corrupt). $hint"
  tar -tf "$tmp/build.tar" >/dev/null || die "Build cache entry is not a valid tar. $hint"
  mkdir "$tmp/stage"
  tar -xf "$tmp/build.tar" -C "$tmp/stage" || die "Build cache entry failed to extract. $hint"
  # <expected-relpath> may be a glob (e.g. '*.app/Info.plist').
  local matches
  # shellcheck disable=SC2206
  matches=("$tmp"/stage/$expected)
  [ -e "${matches[0]}" ] || die "Build cache entry has no '$expected'. $hint"

  rm -rf "$dest"
  mkdir -p "$(dirname "$dest")"
  mv "$tmp/stage" "$dest"
  echo "Restored cached build into $dest"
}

case "${1:-}" in
  key) cmd_key ;;
  pack) shift; [ $# -eq 2 ] || die "usage: $0 pack <src-dir> <file>"; cmd_pack "$@" ;;
  unpack) shift; [ $# -eq 3 ] || die "usage: $0 unpack <file> <dest-dir> <expected-relpath-glob>"; cmd_unpack "$@" ;;
  *) die "usage: $0 key | pack <src-dir> <file> | unpack <file> <dest-dir> <expected-relpath-glob>" ;;
esac
