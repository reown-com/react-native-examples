# E2E Tests with Maestro (Web)

This directory contains end-to-end tests using [Maestro](https://maestro.mobile.dev/).
They run against the **web build** of the POS app (`react-native-web`) driven by
Maestro's Chromium web driver — no Android/iOS build or emulator required.

**CI** (`.github/workflows/ci_e2e_tests_pos_web.yaml`) triggers on the
`deployment_status` event: when Vercel reports a successful `pos-demo`
deployment for a commit, the workflow runs the flows against that deployment's
URL (no build in CI; a manual `workflow_dispatch` against an explicit URL is
also available). This matters because the payment flows need the app's `/api/*`
serverless functions (the payment proxy in `dapps/pos-app/api/`), which only
exist on a Vercel deployment — a static `serve -s dist` build does **not**
serve them.

- Non-payment flows (`invalid-amount`, `keypad`) work against any static server
  (`serve -s dist`).
- Payment flows (`payment-flow`, `payment-cancel`) require the `/api` proxy →
  run against `vercel dev` or a Vercel preview URL.

## Prerequisites

1. Install Maestro CLI:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
   You also need Google Chrome / Chromium installed.

2. Build and serve the web app (from `dapps/pos-app`):
   ```bash
   npm run web:build
   # canvaskit.wasm is emitted at dist/ root, but the bundle requests it from the
   # JS dir — place a copy there so a plain static server can find it:
   mkdir -p dist/_expo/static/js/web
   cp dist/canvaskit.wasm dist/_expo/static/js/web/canvaskit.wasm
   npx serve -s dist -l 8081
   ```
   To run the **payment** flows locally you need the `/api` proxy too — use
   `npx vercel dev --listen 8081` instead of `serve` (serves the static build
   *and* the serverless functions; requires Vercel login + the pay-API env).

3. Configure a merchant so payment flows can reach the amount/scan screens. The
   amount-based flows need `EXPO_PUBLIC_DEFAULT_MERCHANT_ID` and
   `EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY` in `.env` **at build time** (they are
   seeded into the settings store on first load; without them "Start payment"
   redirects to Settings). `payment-flow.yaml` additionally needs *valid* creds +
   network to mint a real gateway QR — in CI these are baked into the tested
   deployment from the Vercel `pos-demo` project's environment variables at
   build time (configured in the Vercel dashboard, not in this repo).

## Running Tests

The flow headers are parametrized as `url: ${APP_URL}`; pass the served URL via
`--env`:

```bash
# All flows
maestro test --env APP_URL=http://localhost:8081 e2e/

# A single flow
maestro test --env APP_URL=http://localhost:8081 e2e/keypad.yaml

# Filter by tag (payment | amount)
maestro test --include-tags amount --env APP_URL=http://localhost:8081 e2e/
```

Add `--headless` to run without a visible browser window (as CI does under xvfb).

## Test Files

| File | Tags | Description |
|------|------|-------------|
| `payment-flow.yaml` | `payment` | Start payment → enter $0.01 → charge → wait for QR → tap QR copies the payment link. Needs valid merchant creds + network. |
| `payment-cancel.yaml` | `payment` | Same prelude as `payment-flow`, then cancel returns to a fresh amount screen (and cancels the payment at the gateway). |
| `invalid-amount.yaml` | `amount` | Charge button stays "Enter amount"/disabled at empty/`0`; enables once a non-zero amount is entered. |
| `keypad.yaml` | `amount` | Keypad decimal handling (single decimal, max 2 fractional digits) and backspace. |

Shared steps live in `common/*.yaml` (the `$0.01`→QR prelude, run via `runFlow`).
Flows there are **not** picked up as standalone tests — neither by CI's
`e2e/*.yaml` glob nor by `maestro test e2e/`.

## Adding New Tests

1. Create a new `.yaml` file in this directory.
2. Start with the web header:
   ```yaml
   url: ${APP_URL}
   name: <description>
   tags:
     - <tag>
   ---
   - launchApp:
       clearState: true
   ```
3. Prefer `testID`-based selectors (`id: "..."`) over visible text.

### Web element-matching notes

- `react-native-web` renders `testID` as `data-testid`; Maestro matches it via `id:`.
- Maestro treats `id:`/`text:` selectors as **regex**. Avoid `.` / `$` / `(` `)` in
  raw selectors — the decimal key therefore has the id `key-decimal` (not `key-.`),
  and amount assertions escape the symbol, e.g. `text: "Charge \\$0.01"` and
  `text: "Euro \\(€\\)"`.
- Keypad ids: `key-0`…`key-9`, `key-decimal`, `key-erase`.
- `startRecording`/`stopRecording` are not supported on web — don't use them.

## Notes

- Tests require a configured merchant (see Prerequisites).
- Payment simulation (wallet connect + pay + success screen) is not yet
  implemented (pending backend support).
