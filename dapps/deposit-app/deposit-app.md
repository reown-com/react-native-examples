## 1. Purpose

A minimal demo app showing how **WalletConnect Pay** can be used as a deposit rail for a custodial trading app. The demo walks through the user journey of funding an in-app token balance by paying from an external self-custody wallet via WalletConnect Pay, with the token selection and payment happening in the wallet.

## 2. Target audience

- Prospects evaluating WalletConnect Pay as a deposit method for centralised products (CEXs, custodial wallets, fintech-style trading apps)

## 3. User journey

1. User opens the app and lands on the **Home** screen — they see their portfolio balance.
2. User taps **Deposit, a modal opens where user can enter USD amount.**
3. User enters an amount
   1. User is using a desktop app: Shows page with 2 options: Open wallet (for browser wallets) and Scan from Mobile Wallet (this is the standard BX page)
   2. User is using a mobile app: Shows wallet selector
4. User completed payment in via selected method
5. The app detects payment completion, transitions to a **Complete** state, and refreshes the balance.
6. User returns to Home — the new balance reflects the deposit.

## 4. Screens

### 4.1 Home

- Header: app name, user avatar.
- Total portfolio value (USD).
- Primary CTA: **Deposit**.
- Secondary section: list of recent activity (mocked).
- Bottom nav: Home · Balance · Trade · Settings.

### 4.2 Deposit — Amount entry

- Method selection: from Bank Account, from Wallet
- Amount input
- CTA: Continue (disabled until amount > 0 and disabled for Bank Account).

### 4.3 Deposit — BX page

1. Desktop: BX page with two options: select a wallet or scan qr
   1. Select wallet:
      1. browser wallet → opens browser wallet for signing
      2. mobile wallet → shows qr
   2. Scan qr:
      1. user scans with phone and completed in the phone
2. Mobile: Select wallet → deeplinks into wallet

### 4.4 Deposit — Complete

- Success checkmark animation.
- "Deposit successful" + amount + token.
- Updated balance shown inline.
- CTAs: **Back to Home** · **Make another deposit**.

## 5. Recipient address

- For v1 use a merchant we set up with the recipient address being the faucet
- v2 could be a built in address configuration

## 6. Prototype notes

https://claude.ai/artifacts/latest/79ca9d32-ee94-4121-b3ba-7cc43efdbfc9

- **Device toggle**: prototype uses a Desktop/Mobile toggle for side-by-side demoing. Production app would detect viewport.
- **Recipient address**: not yet set up — balance simulated for now.
- **Bank method**: shown as "Coming soon", disabled.
