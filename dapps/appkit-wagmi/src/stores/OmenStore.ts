import {proxy} from 'valtio';

/**
 * Mock "funded account" state for the Omen deposit demo.
 *
 * Omen is a stand-in host app (think a trading/prediction app) whose only job here is to show a
 * balance + activity and open the WalletConnect Pay deposit flow in a WebView. The deposit result
 * arrives over the RN WebView bridge (see OmenDepositWebView) and is credited via `credit()`.
 * In-memory only — resets on reload (mirrors the web demo's seed).
 */

export type DepositSource = 'wallet' | 'exchange' | 'direct';

export interface OmenActivity {
  id: string;
  label: string;
  /** Positive = credit, negative = debit. */
  amount: number;
  ts: number;
  /** On-chain tx hash — present only for the real wallet path. */
  txHash?: string;
}

interface State {
  balance: number;
  activity: OmenActivity[];
}

const state = proxy<State>({
  balance: 1182.85,
  activity: [
    {id: 't3', label: 'Evaluation fee', amount: -299.99, ts: Date.now() - 86_400_000},
    {id: 't2', label: 'Payout — June', amount: 1250, ts: Date.now() - 3 * 86_400_000},
    {id: 't1', label: 'Deposit — Coinbase', amount: 62.35, ts: Date.now() - 5 * 86_400_000},
  ],
});

const OmenStore = {
  state,

  /**
   * Credit a completed deposit and prepend an activity row. The amount may be chosen inside the
   * wallet and not reported back, so we fall back to a nominal demo amount (mirrors the web demo).
   * Returns the credited amount so the caller can show it in the success view.
   */
  credit({amount, source, txHash}: {amount?: number; source?: DepositSource; txHash?: string}): number {
    const credited = amount && amount > 0 ? amount : 25;
    const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : 'Crypto';

    state.balance = Math.round((state.balance + credited) * 100) / 100;
    state.activity = [
      {
        id: `dep_${Date.now().toString(36)}`,
        label: `Deposit — ${sourceLabel}`,
        amount: credited,
        ts: Date.now(),
        txHash,
      },
      ...state.activity,
    ];

    return credited;
  },
};

export default OmenStore;
