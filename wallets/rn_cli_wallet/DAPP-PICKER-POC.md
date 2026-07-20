# Dapp Picker POC (H2b) — wallet side

The wallet ships an **Explore** tab: a curated directory of fee-honoring
dapps. Tapping a tile opens the dapp in a webview with a **monetized
WalletConnect session pre-established** — the user lands already connected,
`wc_feeTerms` attached, and every swap pays the wallet via the session-fees
mechanism (see `web-examples` branch `dapp-picker-poc`, PR #1042 lineage).

## How it works

1. **Explore tab** (`src/screens/Explore`) — four tiles (Jupiter, 1inch,
   KyberSwap, Uniswap). All open the same Session Fees POC dapp with a
   different `?aggregator=` default (the "picker illusion"); tile data is
   shaped like a future registry entry (`PICKER_DAPPS` in
   `src/utils/PickerUtil.ts`). First tap shows a **one-time consent alert**
   ("Auto-connect to dapps opened from Explore?"), persisted in MMKV.
2. **Webview host** (`src/screens/DappBrowser`) — the dapp page acquires a
   WC pairing URI and posts `{type:'wc_session_offer', uri}` via
   `window.ReactNativeWebView.postMessage`; a `wc:` navigation intercept
   (`onShouldStartLoadWithRequest`) is the fallback. The host registers the
   pairing topic as picker-initiated and calls `walletKit.pair({uri})`.
3. **Auto-approve** (`src/hooks/useWalletKitEventsManager.ts`) — proposals
   whose `pairingTopic` was registered by the webview are approved directly
   (full supported namespaces + sessionProperties) when consent is granted;
   any failure falls back to the normal proposal modal. **All other
   proposals are untouched** — the normal modal flow applies.
4. **Fee terms** (`src/utils/PickerUtil.ts`) — every approval (modal or
   auto) now carries
   `wc_feeTerms = {"version":1,"feeRecipient":"9zYt…","feeRecipientEip155":"0x879d…","feeBps":50}`
   — the same demo recipients the Session Fees POC collects on (Solana USDC
   ATA already initialized; EVM EOA holds the KyberSwap/Uniswap fees).
5. **Connect-variant toggle** — Settings → "Explore: headless connect"
   switches tiles between `?connect=headless` (AppKit Headless) and
   `?connect=provider` (provider-direct). Default: headless.

## Setup / run

```bash
cd wallets/rn_cli_wallet
cp .env.example .env         # set EXPO_PUBLIC_PROJECT_ID
yarn install
yarn ios                     # or: yarn android
```

Env (all optional, hardcoded demo defaults): `EXPO_PUBLIC_FEE_RECIPIENT_SOLANA`,
`EXPO_PUBLIC_FEE_RECIPIENT_EVM`, `EXPO_PUBLIC_FEE_BPS`,
`EXPO_PUBLIC_PICKER_DAPP_URL` (defaults to the `dapp-picker-poc` Vercel
preview of react-dapp-v2).

Machine gotchas found while building this POC:
- **iOS**: if the Android NDK toolchain is in your `PATH`, its `clang`
  shadows Apple's and an Expo pod script fails with
  `ld64.lld: error: library not found for -lSystem`. Strip it for iOS builds:
  `PATH=$(echo "$PATH" | tr ':' '\n' | grep -v "ndk/" | paste -sd: -) yarn ios`.
- Run `pod install` (`ios/`) if xcodebuild complains the sandbox is out of
  sync with Podfile.lock.

## Demo script (~60 s)

1. Open the wallet → **Explore** tab: four fee-sharing dapps.
2. Tap **KyberSwap** (or Jupiter for Solana) → consent alert (first time
   only) → **Allow**.
3. The dapp loads **already connected**: "✓ Connected via rn_cli_wallet —
   fee sharing active", aggregator preselected, fee terms card showing
   0.50% / recipient.
4. Enter an amount → Swap → the wallet's normal sign sheet appears over the
   webview → sign once.
5. Fee lands on-chain in the same transaction (Solscan ATA / Arbiscan EOA
   linked from the dapp's live fee-balance card).

Tap count to connected: **1 tap** (tile) after the one-time consent —
the H2b claim holds.

## Corners cut (POC)

- Explore tiles are a hardcoded array, not a registry; icons are colored
  glyphs, not brand assets; Android tab icon reuses the connections svg.
- Auto-approval trusts the pairing topic registered by the webview — no
  origin verification of the page inside the webview beyond the tile URL.
- One-time consent is an OS alert, not a designed sheet.
- Fee recipients are hardcoded demo addresses (env-overridable).
- The modal's supportedNamespaces map is duplicated in PickerUtil (kept in
  sync manually) rather than refactored to one source.
- Web build (`HomeTabNavigator.web.tsx`) does not get the Explore tab.
