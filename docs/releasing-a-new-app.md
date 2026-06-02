# Runbook: Releasing a New App to TestFlight

This runbook describes how to take a new app in this monorepo from "code is ready" to
"installable on TestFlight" — **almost entirely from CI**. The only manual step is creating
the App Store Connect app record (see below). You do **not** need Ruby, fastlane, or
CocoaPods installed on your machine.

The flow is one manual step + two GitHub Actions:

1. **Create the App ID + App Store Connect record manually** (Developer Portal → Identifiers,
   then App Store Connect → Apps → +). This can't be automated — fastlane `produce` only
   supports Apple ID + 2FA, not the API key — and must come first, because `match` requires
   the App ID to already exist. Run **once per app**.
2. **Create iOS Certificates** (`.github/workflows/create-ios-certs.yaml`) — creates the app's
   signing certificates for that App ID. Run **once per app**.
3. **Release `<app>`** (e.g. `.github/workflows/release-merchant-pos.yaml`) — builds and
   uploads to TestFlight. Run on every release.

Certificates live in the match repo **`reown-com/mobile-match`** (git-encrypted). Cert and
signing auth use the **App Store Connect API key**, so there is no Apple ID / 2FA prompt on CI.

> Worked example throughout: **Merchant POS** — `dapps/merchant-pos-app`,
> bundle id `com.reown.merchantpos`, scheme `MerchantPOS`.

---

## Prerequisites (one-time, org-wide)

These already exist for the existing apps; confirm before onboarding a brand-new app:

| Secret / var | Type | Purpose |
| --- | --- | --- |
| `APPLE_KEY_ID`, `APPLE_ISSUER_ID`, `APPLE_KEY_CONTENT` | secret | App Store Connect API key (auth + signing, no 2FA) |
| `APPLE_USERNAME` | secret | Apple account email (TestFlight upload) |
| `MATCH_GIT_URL` | secret | SSH URL of the match repo |
| `MATCH_SSH_KEY` | secret | Deploy key with write access to `reown-com/mobile-match` |
| `MATCH_KEYCHAIN_PASSWORD` | secret | Match encryption password (passed to fastlane as `MATCH_PASSWORD`) |
| `MATCH_USERNAME` | secret | Apple account email for match/keychain |
| `SLACK_WEBHOOK_URL` | secret | Build notifications |

> **No GitHub token needed.** Cert creation pushes a branch to the certs repo over SSH using
> the existing `MATCH_SSH_KEY`; a teammate opens & merges the PR manually. There is no
> cross-repo PAT/token to provision.

---

## Step 1 — Configure the app

In the app's `app.json`, make sure these are set:

- `expo.name` — the human app name (e.g. `Merchant POS`). The iOS **scheme** is this name
  with spaces/punctuation removed → `MerchantPOS`. (`WPay` → `WPay`.)
- `expo.ios.bundleIdentifier` and `expo.android.package` (e.g. `com.reown.merchantpos`).

> **Confirm the scheme name:** run `npx expo prebuild --platform ios` in the app folder once
> and check the generated `ios/*.xcworkspace` / scheme name. Use that exact string as
> `scheme-name` in the release workflow. (Native folders are gitignored — CI regenerates them.)

---

## Step 2 — Add the app's GitHub secrets / vars

Per-app, in repo **Settings → Secrets and variables → Actions**. Naming convention is the
app name uppercased (e.g. `MERCHANTPOS_*`):

| Name | Type | Encoding | Notes |
| --- | --- | --- | --- |
| `MERCHANTPOS_ENV_FILE` | secret | **plain text** | Pasted verbatim into `.env` — do **not** base64-encode |
| `MERCHANTPOS_SENTRY_FILE` | secret | **plain text** | Appended to `sentry.properties`. Can be empty if the app has no Sentry |
| `TESTFLIGHT_MERCHANTPOS_URL` | var | — | TestFlight public link (for the Slack button) |
| `MERCHANTPOS_ANDROID_FIREBASE_APP_ID` | var | — | Firebase App ID — **Android only** |
| `FIREBASE_MERCHANTPOS_URL` | var | — | Firebase distribution link — **Android only** |

> **Encoding:** the env, Sentry, and `secrets.properties` files are stored as **plain text**
> (CI just `echo`s them into a file). The **only** base64-encoded secret is the Android
> keystore (`WC_PROD_KEYSTORE`), which CI runs through `base64 --decode`.

Shared secrets (`APPLE_*`, `MATCH_*`, keystore, `SLACK_WEBHOOK_URL`, `ANDROID_SECRETS_FILE`)
are reused — no new copies needed.

---

## Step 3 — Create the App ID + App Store Connect record (manual)

This is the one part that can't run on CI: fastlane `produce` only authenticates with an
Apple ID + 2FA, not the API key. It also has to happen **before** certificates — `match`
requires the identifier to already exist and fails with "Couldn't find bundle identifier"
otherwise. Done **once per app**, ~2 minutes.

1. **Register the App ID first** — this is mandatory and easy to miss: the "New App" dialog
   only lets you *select* an existing Bundle ID, it won't create one. Go to
   [Developer Portal → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
   → **＋** → App IDs → App → set the Bundle ID to `com.reown.merchantpos`. Only after this
   will it appear in the dropdown in the next step.
2. **Create the App Store Connect record:** [App Store Connect → Apps](https://appstoreconnect.apple.com/apps)
   → **＋** → **New App**:
   - **Platform:** iOS
   - **Name:** the **App Store display name**. ⚠️ This must be **globally unique across all of
     App Store Connect** (not just your account) — e.g. plain `Merchant POS` may already be
     taken, so use a distinct variant (e.g. `Reown Merchant POS`). This name is **only** the
     store listing; it does **not** need to match the app's local name or scheme, and it has
     **no effect on the build or release** (CI keys off the bundle id + Apple App ID).
   - **Primary language**
   - **Bundle ID:** select `com.reown.merchantpos` (from step 1)
   - **SKU:** any unique string (the bundle id is fine)
3. Open the created app and **copy its numeric Apple App ID** from the URL or the App
   Information page (e.g. `6754570257`). You'll paste this into the release workflow in Step 6.
4. **Create the TestFlight group.** In the new app → **TestFlight** tab → **Groups** → **＋**,
   create a group whose name exactly matches the `testflight-groups` value in the release
   workflow (e.g. **`Internal`**). The upload step assigns the build to this group, so it must
   exist first — otherwise the release fails at the TestFlight step. Add testers to it as needed.

---

## Step 4 — Run "Create iOS Certificates"

Actions → **Create iOS Certificates** → **Run workflow** (use the `feat/...` branch via
**"Use workflow from"** until it's merged to `main`):

- `bundle-id`: `com.reown.merchantpos`
- `certs-repo`: `reown-com/mobile-match` (default)
- `match-types`: `appstore,development` (default)

This creates **appstore** + **development** certs for the App ID registered in Step 3, pushing
each to a `certs/add-…` branch in `reown-com/mobile-match`.

> **Idempotent.** `match` runs without `force` flags, so existing certificates/profiles are
> **reused, never revoked or recreated**. The shared distribution certificate is reused and
> only a missing provisioning profile is added. If everything already exists, the branch comes
> out identical to `master` (empty diff) — nothing to merge.

> ⚠️ **The branches are NOT merged automatically.** The release workflow (Step 7) will fail
> until they are merged. The run summary lists each branch with a one-click "open PR" link.

---

## Step 5 — Merge the certificate PRs

In `reown-com/mobile-match`, open the PR(s) linked from the run summary (one per match type)
and merge them into `master`. **Until this is done the release will fail** with a missing
provisioning profile / certificate error.

---

## Step 6 — Add the release workflow

Copy an existing dispatcher (`release-pos.yaml` is the template) to `release-<app>.yaml`
and fill in:

- `root-path`, `bundle-id`, `scheme-name` (from Step 1), `name`
- `apple-id` — the **Apple App ID** from Step 3 (replace the `REPLACE_WITH_APPLE_APP_ID`
  placeholder)
- `testflight-groups` — e.g. `Internal` or `External` (the group must exist in App Store
  Connect → TestFlight first)
- the `MERCHANTPOS_*` secrets/vars from Step 2

For Merchant POS this file already exists: `.github/workflows/release-merchant-pos.yaml` —
just set the real `apple-id`.

---

## Step 7 — Release

> **Precondition:** the certificate PR(s) from Step 5 must already be merged into `master`,
> otherwise the build fails when it can't find the provisioning profile.

Actions → **Release Merchant POS** → **Run workflow** → pick `ios` (or `both`).

The base workflow runs `expo prebuild`, syncs certs from `reown-com/mobile-match` (readonly),
builds with `gym`, bumps the build number, and uploads to TestFlight. Watch for the Slack
notification with the build result + TestFlight link.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Build fails at `gym` with "scheme not found" | `scheme-name` doesn't match the prebuilt scheme. Re-check Step 1 (`expo prebuild` → scheme name). |
| Cert creation prompts for 2FA / hangs | API-key env vars (`APPLE_KEY_*`) weren't set, so it fell back to Apple ID auth. On CI they come from secrets — confirm they exist. |
| Cert creation: "Couldn't find bundle identifier ..." | The App ID isn't registered yet. Do Step 3 (register the App ID in the Developer Portal / create the app) before running Create iOS Certificates. |
| Release fails: "no profile for ... / doesn't match" | The certs PR (Step 5) wasn't merged. Merge the `certs/add-…` branch in `reown-com/mobile-match`, then re-run the release. |
| Release fails at `gym`: **"Provisioning profile … doesn't include signing certificate Apple Distribution …"** | The profile bound to a distribution cert that isn't the one in the match repo. See ["Profile doesn't include signing certificate"](#profile-doesnt-include-signing-certificate-multiple-distribution-certs) below. |
| Certs branch already exists | A previous partial run left `certs/add-<bundle>-<type>`. Delete it in `reown-com/mobile-match` (or merge its PR) and re-run. |
| Upload fails: "no such app" / TestFlight group missing | Create the app record first (Step 3); create the TestFlight group before using it in `testflight-groups`. |
| Bundle ID not in App Store Connect's "New App" dropdown | The App ID isn't registered in the Developer Portal yet — do Step 3.1 (Identifiers → ＋), then create the app record. |

---

## "Profile doesn't include signing certificate" (multiple distribution certs)

**Symptom** — the release build fails at `gym` / archive with:

```
Provisioning profile "match AppStore com.reown.<app>" doesn't include signing
certificate "Apple Distribution: reown, inc. (W5R8AG9K22)". ** ARCHIVE FAILED **
```

…even though `match` ran fine and "All required keys, certificates and provisioning
profiles are installed 🙌". Regenerating the profile doesn't help — it fails identically.

**Root cause** — when match creates an App Store provisioning profile it binds the profile to
a **single distribution certificate**, but the match repo (`reown-com/mobile-match`) only holds
the **private key for one** distribution cert (currently `VA3YAXTFS7`). If the Apple Developer
Portal has **several** distribution certs (they accumulate over time — e.g. each is one Apple
created via the App Store Connect API key, or older "iOS Distribution" ones), match may bind the
new profile to a cert whose private key **isn't** in the repo. At build time match installs the
repo cert, the profile references a different one, and they don't match → archive fails.

Confirm by reading the **Create iOS Certificates** run log: under "Creating new provisioning profile" it
prints the distribution certs it can see (`- Name: reown, inc. - ID: … - Expires …`). More than
one line ⇒ this is the cause. When only the repo cert remains, it prints none and binds cleanly.

**Possible solution — reduce the portal to the one distribution cert the repo holds.** match
needs to see exactly one distribution cert (the one in `certs/distribution/`, currently
`VA3YAXTFS7`) so the profile can only bind to it. That means removing the *extra* distribution
certs — but treat this as shared infrastructure and **verify each one is unused before revoking**:

1. List the candidates from the Create iOS Certificates log and the portal. The keeper is the cert whose
   `.cer/.p12` is under `certs/distribution/` in `mobile-match` (`VA3YAXTFS7`). **Match them by
   expiry date — not "Created By"**, since the keeper and the extras can all show the same
   API-key creator.
2. For each *other* distribution cert, confirm it's safe to revoke before doing so:
   - Its private key is **not** in `mobile-match` (only `VA3YAXTFS7`'s is) → no match-based build
     can use it.
   - The match-based projects (`react-native-examples`, `reown-swift`, `reown_flutter`) all sign
     with the repo cert via match — grep their `Fastfile`/release workflows for `MATCH_GIT_URL`
     and `code_sign_identity` to confirm.
   - **Leave** any **"Distribution Managed"** cert created by a *person* (Xcode-managed — e.g. the
     Unity app's, created manually). match doesn't list those, so they don't interfere; revoking
     one could break a manual/CI pipeline.
   - If unsure who uses a cert, ask before revoking — distribution certs are shared across teams.
3. Revoke the confirmed-unused extras (this includes legacy "iOS Distribution" certs — they bind
   the profile too if left).
4. Delete the app's `match AppStore <bundle-id>` profile in the portal **and** remove
   `profiles/appstore/AppStore_<bundle-id>.mobileprovision` from `mobile-match` (PR).
5. Re-run **Create iOS Certificates** (`appstore`). With one distribution cert left, the new profile binds
   to it. Merge the cert PR, then re-run the release.

> **Prevention:** keep `mobile-match` to a single Apple-Distribution cert, and rotate it
> cleanly (don't let CI runs accumulate new distribution certs). Watch the keeper's expiry.

---

## Running certificate creation locally (fallback)

CI is the recommended path. If you must run locally, you need Ruby 3.3.0 + `bundle install`
(see the root `README.md`), then:

```bash
# API-key auth (no 2FA) — export the APPLE_KEY_* + MATCH_PASSWORD env vars first
./scripts/create-certificates.sh reown-com/mobile-match com.reown.merchantpos "" appstore --auto-merge

# Or interactive Apple ID auth (will prompt for 2FA)
./scripts/create-certificates.sh reown-com/mobile-match com.reown.merchantpos dev@reown.com appstore
```
