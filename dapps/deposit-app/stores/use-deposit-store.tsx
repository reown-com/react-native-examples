import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { ActivityItem, INITIAL_ACTIVITY, INITIAL_BALANCE } from '@/data/activity';
import { fetchPortfolio, TokenBalance } from '@/services/balance';
import {
  cancelPayment,
  getPaymentStatus,
  nextPollMs,
  PaymentStatus,
  startPayment,
} from '@/services/pay';
import { relativeTime } from '@/utils/format';
import { BALANCE_TTL_MS, getJSON, removeKeys, setJSON, STORAGE_KEYS } from '@/utils/storage';

/** A deposit completed through the flow, persisted so the feed survives reloads. */
interface DepositRecord {
  amount: number;
  createdAt: number;
  paymentId?: string;
}

interface PortfolioCache {
  total: number;
  tokens: TokenBalance[];
  fetchedAt: number;
}

function depositToActivity(d: DepositRecord): ActivityItem {
  const formatted = `+$${d.amount.toFixed(2)}`;
  return {
    type: 'deposit',
    label: 'Deposit',
    sub: 'via WalletConnect Pay',
    amount: formatted,
    value: formatted,
    time: relativeTime(d.createdAt),
    positive: true,
  };
}

/**
 * Deposit flow state machine + WalletConnect Pay integration.
 *
 *   amount → checkout → complete
 *
 * Confirming an amount creates a real payment via the Pay API (see
 * services/pay.ts), exactly like the POS demo. The returned `gatewayUrl` is the
 * branded checkout (BX) link. Because that page forbids iframing
 * (X-Frame-Options: DENY), it is surfaced differently per platform:
 *   - web:    opened in a new tab/popup; the modal shows a "waiting" state.
 *   - native: embedded in a WebView inside the sheet.
 * Either way the payment's status is polled; when it settles to `succeeded` the
 * balance is credited, a deposit is recorded, and the flow lands on `complete`.
 *
 * Abandoning checkout cancels the payment via the API: when the in-app deposit
 * modal is closed (closeDeposit) on any platform. The external checkout tab is
 * intentionally not tracked.
 */
export type DepositStep = 'amount' | 'checkout' | 'complete';
export type DepositMethod = 'wallet' | 'bank';

const isWeb = Platform.OS === 'web';
const DEMO_ACCOUNT = process.env.EXPO_PUBLIC_DEMO_ACCOUNT ?? '';
// Stop polling after this many consecutive status errors (~40s at 2s cadence).
const MAX_POLL_ERRORS = 20;

interface DepositState {
  // Account
  balance: number;
  tokens: TokenBalance[];
  isLoadingBalance: boolean;
  refreshBalance: () => void;
  clearDemoData: () => void;
  activity: ActivityItem[];
  // Flow
  isOpen: boolean;
  step: DepositStep;
  amount: string;
  method: DepositMethod;
  // Payment
  paymentId: string | null;
  gatewayUrl: string | null;
  paymentStatus: PaymentStatus | null;
  isCreating: boolean;
  error: string | null;
  // Actions
  openDeposit: () => void;
  closeDeposit: () => void;
  setAmount: (value: string) => void;
  setMethod: (method: DepositMethod) => void;
  continueToCheckout: () => void;
  reopenCheckout: () => void;
}

const DepositContext = createContext<DepositState | null>(null);

export function DepositProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  // On-chain portfolio total, kept separate so session deposits add on top of it.
  const portfolioBaseRef = useRef(0);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<DepositMethod>('wallet');

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollErrorsRef = useRef(0);
  const creditedRef = useRef(false);
  // Sum of credited deposits, layered on top of the portfolio base.
  const depositedTotalRef = useRef(0);
  // The persisted deposit records (newest first).
  const depositsRef = useRef<DepositRecord[]>([]);
  // Once true, the payment has reached a terminal state and must not be
  // (re-)cancelled by closeDeposit.
  const finalizedRef = useRef(false);
  const paymentIdRef = useRef<string | null>(null);
  // Latest amount, so the poll loop credits the right value without re-subscribing.
  const amountRef = useRef(amount);
  amountRef.current = amount;
  // Handle to the popup opened synchronously on the user's click (web).
  const popupRef = useRef<Window | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const applyPortfolio = useCallback((total: number, list: TokenBalance[]) => {
    portfolioBaseRef.current = total;
    setTokens(list);
    setBalance(total + depositedTotalRef.current);
  }, []);

  const fetchAndStore = useCallback(async () => {
    if (!DEMO_ACCOUNT) return;
    setIsLoadingBalance(true);
    try {
      const { total, tokens: list } = await fetchPortfolio(DEMO_ACCOUNT);
      applyPortfolio(total, list);
      const cache: PortfolioCache = { total, tokens: list, fetchedAt: Date.now() };
      await setJSON(STORAGE_KEYS.portfolio, cache);
    } catch {
      // Leave the last known balance in place on failure.
    } finally {
      setIsLoadingBalance(false);
    }
  }, [applyPortfolio]);

  // Apply the cached portfolio, and only hit the network if the cache is older
  // than the TTL (balance refreshes at most once per hour).
  const refreshBalance = useCallback(async () => {
    const cache = await getJSON<PortfolioCache>(STORAGE_KEYS.portfolio);
    if (cache) applyPortfolio(cache.total, cache.tokens);
    const stale = !cache || Date.now() - cache.fetchedAt > BALANCE_TTL_MS;
    if (stale) await fetchAndStore();
  }, [applyPortfolio, fetchAndStore]);

  // On mount: restore persisted deposits (so the feed + balance are populated
  // immediately), then load the balance (cached or refreshed).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = (await getJSON<DepositRecord[]>(STORAGE_KEYS.deposits)) ?? [];
      if (cancelled) return;
      depositsRef.current = stored;
      depositedTotalRef.current = stored.reduce((sum, d) => sum + d.amount, 0);
      if (stored.length) setActivity(stored.map(depositToActivity));
      setBalance(portfolioBaseRef.current + depositedTotalRef.current);
      await refreshBalance();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshBalance]);

  // Wipe persisted deposits + cached balance for a clean demo, then refetch.
  const clearDemoData = useCallback(async () => {
    await removeKeys([STORAGE_KEYS.deposits, STORAGE_KEYS.portfolio]);
    depositsRef.current = [];
    depositedTotalRef.current = 0;
    portfolioBaseRef.current = 0;
    setActivity([]);
    setTokens([]);
    setBalance(0);
    await fetchAndStore();
  }, [fetchAndStore]);

  const creditDeposit = useCallback(() => {
    if (creditedRef.current) return;
    creditedRef.current = true;
    const amt = parseFloat(amountRef.current) || 0;
    const record: DepositRecord = {
      amount: amt,
      createdAt: Date.now(),
      paymentId: paymentIdRef.current ?? undefined,
    };
    depositsRef.current = [record, ...depositsRef.current];
    depositedTotalRef.current += amt;
    setActivity(depositsRef.current.map(depositToActivity));
    setBalance((prev) => prev + amt);
    setJSON(STORAGE_KEYS.deposits, depositsRef.current);
  }, []);

  // Poll payment status until it reaches a final state.
  const poll = useCallback(
    async (id: string) => {
      try {
        const res = await getPaymentStatus(id);
        pollErrorsRef.current = 0;
        setPaymentStatus(res.status);
        if (res.status === 'succeeded') {
          finalizedRef.current = true;
          stopPolling();
          creditDeposit();
          setStep('complete');
          return;
        }
        if (res.isFinal) {
          // failed | expired | cancelled
          finalizedRef.current = true;
          stopPolling();
          setError(`Payment ${res.status}`);
          return;
        }
        pollTimer.current = setTimeout(() => poll(id), nextPollMs(res));
      } catch {
        // Transient error — retry up to a cap, then give up so we don't hammer
        // the status endpoint during a sustained outage.
        pollErrorsRef.current += 1;
        if (pollErrorsRef.current > MAX_POLL_ERRORS) {
          stopPolling();
          setError('Payment status unavailable — please try again');
          return;
        }
        pollTimer.current = setTimeout(() => poll(id), nextPollMs(null));
      }
    },
    [creditDeposit, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    creditedRef.current = false;
    finalizedRef.current = false;
    paymentIdRef.current = null;
    popupRef.current = null;
    setStep('amount');
    setAmount('');
    setMethod('wallet');
    setPaymentId(null);
    setGatewayUrl(null);
    setPaymentStatus(null);
    setIsCreating(false);
    setError(null);
  }, [stopPolling]);

  const openDeposit = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  const closeDeposit = useCallback(() => {
    setIsOpen(false);
    stopPolling();
    // Cancel a still-pending payment when the in-app modal is dismissed.
    if (!finalizedRef.current && paymentIdRef.current) {
      finalizedRef.current = true;
      cancelPayment(paymentIdRef.current).catch(() => {});
    }
    setTimeout(reset, 300);
  }, [reset, stopPolling]);

  // Step 1 → create the payment, surface the checkout, and start polling.
  const continueToCheckout = useCallback(async () => {
    if (isCreating) return;
    setError(null);
    setIsCreating(true);
    pollErrorsRef.current = 0;

    // On web, open the popup synchronously (inside the click handler) so it
    // isn't blocked; point it at the gatewayUrl once the payment is created.
    // Detach the opener so the checkout page can't navigate us back
    // (reverse tabnabbing) while we keep the handle to drive its location.
    if (isWeb) {
      popupRef.current = window.open('about:blank', '_blank');
      if (popupRef.current) popupRef.current.opener = null;
    }

    try {
      const res = await startPayment(amount);
      paymentIdRef.current = res.paymentId;
      finalizedRef.current = false;
      creditedRef.current = false;
      setPaymentId(res.paymentId);
      setGatewayUrl(res.gatewayUrl);
      setPaymentStatus(res.status ?? 'requires_action');

      if (isWeb) {
        if (popupRef.current) {
          popupRef.current.location.href = res.gatewayUrl;
        } else {
          // Popup was blocked — fall back to opening in a new tab.
          popupRef.current = window.open(res.gatewayUrl, '_blank', 'noopener,noreferrer');
        }
      }

      setStep('checkout');
      const firstPoll =
        typeof res.pollInMs === 'number' && res.pollInMs > 0 ? res.pollInMs : nextPollMs(null);
      pollTimer.current = setTimeout(() => poll(res.paymentId), firstPoll);
    } catch (e) {
      if (isWeb && popupRef.current) popupRef.current.close();
      popupRef.current = null;
      setError(e instanceof Error ? e.message : 'Could not start the deposit');
    } finally {
      setIsCreating(false);
    }
  }, [amount, isCreating, poll]);

  // Web only: re-open the checkout tab if the user closed it.
  const reopenCheckout = useCallback(() => {
    if (isWeb && gatewayUrl && !finalizedRef.current) {
      popupRef.current = window.open(gatewayUrl, '_blank', 'noopener,noreferrer');
    }
  }, [gatewayUrl]);

  const value = useMemo<DepositState>(
    () => ({
      balance,
      tokens,
      isLoadingBalance,
      refreshBalance,
      clearDemoData,
      activity,
      isOpen,
      step,
      amount,
      method,
      paymentId,
      gatewayUrl,
      paymentStatus,
      isCreating,
      error,
      openDeposit,
      closeDeposit,
      setAmount,
      setMethod,
      continueToCheckout,
      reopenCheckout,
    }),
    [
      balance,
      tokens,
      isLoadingBalance,
      refreshBalance,
      clearDemoData,
      activity,
      isOpen,
      step,
      amount,
      method,
      paymentId,
      gatewayUrl,
      paymentStatus,
      isCreating,
      error,
      openDeposit,
      closeDeposit,
      continueToCheckout,
      reopenCheckout,
    ],
  );

  return <DepositContext.Provider value={value}>{children}</DepositContext.Provider>;
}

export function useDepositStore(): DepositState {
  const ctx = useContext(DepositContext);
  if (!ctx) {
    throw new Error('useDepositStore must be used within a DepositProvider');
  }
  return ctx;
}
