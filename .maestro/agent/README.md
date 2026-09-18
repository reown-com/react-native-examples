# Dev agent — Maestro + in-app RPC (PoC)

An RPC channel into a running `rn_cli_wallet` build, so E2E flows can set up
state and locate elements without paying Maestro's per-command cost, while still
driving the real UI with real touches.

**Status: proof of concept.** Nothing in CI runs these flows. They are tagged
`agent-poc`, so `--include-tags pay` never picks them up.

## Why

Two costs in the current `pay` suite:

1. **The prelude.** 12 commands and 4 taps (scanner → paste URL → submit → wait
   for merchant info), with a worst-case wait budget of 310s, repeated for each
   of the 11 flows because every one does `clearState` + a cold start.
2. **The per-command tax.** On native, Maestro dumps the whole view hierarchy
   (UiAutomator on Android, XCUITest on iOS) before every `tapOn` and
   `assertVisible`, matches against it, and re-polls until it settles.

The agent attacks both: one socket round-trip replaces the prelude's tap
sequence, and `query` replaces the hierarchy dump with the app answering "where
is this?" itself.

## What it deliberately does not do

- **It does not tap.** `query` returns coordinates; Maestro still delivers a real
  OS touch at that point. Calling `onPress()` from the React tree would be
  faster and would also pass for a button that is invisible, covered by a modal
  or off-screen — a test that looks like it exercises the UI and does not.
- **It cannot detect occlusion.** Nothing in the React tree knows another view is
  drawn on top. A point tap that misses while `query` reports `found` is real
  evidence of exactly that, and is worth investigating rather than working around.
- **It does not replace the full-path flows.** The upstream prelude
  (`flows/pay_open_and_paste_url.yaml`) still exercises scanner → paste → submit
  on every `pay` flow, and must keep doing so. The socket is additive. If someone
  later "optimises" the upstream prelude away, the suite stops testing that a
  user can reach payment at all.
- **Not for NFC or camera flows.** There the whole value is the physical path.

## Architecture

JS cannot open a server socket without a native module, so the roles are
inverted — the same trick Metro and React DevTools use:

```
Maestro  --HTTP :7789-->  daemon  --WS :7788-->  app (WebSocket client)
         <---------------          <---------------
```

- `wallets/rn_cli_wallet/scripts/dev-agent-daemon.js` — the relay. Dependency-free
  (it speaks enough of RFC 6455 for one client), so it runs under plain `node`
  and adds nothing to `yarn.lock`.
- `wallets/rn_cli_wallet/src/utils/devAgent.ts` — the in-app client. Inert unless
  `EXPO_PUBLIC_DEV_AGENT=true` at build time.
- `agent.js` / `health.js` here — the Maestro side.

No `adb reverse` is needed: the Android emulator reaches the host at `10.0.2.2`
(the same magic host the CI pipeline already uses for pay-core); the iOS
simulator and web use `localhost`.

## Commands

| cmd | args | returns |
|---|---|---|
| `ping` | — | `{ok, platform, payApiBaseUrl, testMode}` |
| `state` | — | `{payment:{step, resultStatus, resultErrorType, …}, modal, settings, nav}` |
| `pair` | `{uri}` | Calls the same `handleUriOrPaymentLink` the UI does |
| `navigate` | `{screen, params}` | Imperative navigation |
| `back` | — | `goBack()` |
| `closeModal` | — | `ModalStore.close()` |
| `query` | `{testID}` | `{found, strategy, x, y, width, height, dp, onScreen, opacity}` |

`query` coordinates are the element's **centre in physical pixels**, which is
what Maestro's `tapOn: point:` expects. `dp` carries the raw
density-independent rect for debugging the conversion.

## Running it

```bash
# 1. daemon (host)
node wallets/rn_cli_wallet/scripts/dev-agent-daemon.js

# 2. build with the agent compiled in
cd wallets/rn_cli_wallet
cat >> .env <<'ENV'
EXPO_PUBLIC_DEV_AGENT=true
EXPO_PUBLIC_TEST_MODE=true
EXPO_PUBLIC_TEST_PRIVATE_KEY=<a funded test key>
ENV
yarn android:internal          # iOS: APP_VARIANT=internal yarn ios:internal

# 3. confirm the channel before blaming Maestro
curl localhost:7789/health     # -> {"ok":true,"connected":true}

# 4. flows
cd ../..
maestro test --include-tags agent-poc \
  --env APP_ID=com.walletconnect.web3wallet.rnsample.internal \
  .maestro/agent_smoke.yaml
```

`agent_hybrid_pay.yaml` additionally needs `--env PAY_GATEWAY_URL=<url>`, a
funded wallet and network. Mint a URL with the upstream
`scripts/create-payment.js` (fetched by `scripts/setup-maestro-pay-tests.sh`).

## Run the smoke flow first

`agent_smoke.yaml` costs nothing and validates the parts most likely to be
wrong on a new device: that the channel is up, that `testID` resolution works,
and that the dp→px conversion is right. It taps the point `query` reports and
then asserts via the store that the modal actually opened — so a bad conversion
factor fails there, loudly, instead of somewhere deep in a pay flow.

## `query` resolution: two strategies

`query` reports which one answered, in `strategy`:

- **`fiber`** — walks React's internal tree for `props.testID`. Needs no product
  code changes, but depends on React internals (a class-component probe's
  `_reactInternals`; the DevTools global hook is not available in the
  release-flavoured `internal` builds CI tests).
- **`registry`** — components opt in with `useAgentTarget(testID)` from
  `@/utils/agentQuery`. Always works, but only covers what has been wired up.

`fiber` is tried first, `registry` is the fallback. **The fiber walk has not yet
been validated on a device** — it is the main technical risk here. If the smoke
flow reports `strategy: "registry"` or a fiber-walk error, wire the targets you
need explicitly:

```tsx
const ref = useAgentTarget('button-scan');
<Button ref={ref} testID="button-scan" onPress={...} />
```

## Troubleshooting

| Symptom | Cause |
|---|---|
| `no daemon on http://localhost:7789` | Daemon not started. |
| `daemon is up but no app is connected` | Build lacks `EXPO_PUBLIC_DEV_AGENT=true`, app not running, or it cannot reach the host. |
| Taps land in the wrong place | The dp→px factor. Compare `x`/`y` against `dp` in the `query` result. |
| `found: false` | The testID is not mounted, or the fiber walk broke — check `strategy` and `error`. |

The daemon pings the app every 5s and drops the connection when no pong comes
back, so a killed or reloaded app shows up as `connected: false` within ~10s
instead of leaving commands to hang until they time out.
