/**
 * WalletConnect Pay client for the deposit flow. Mirrors how the POS demo
 * (dapps/pos-app) creates and tracks payments:
 *
 *   - POST  {API_URL}/merchant/payment            → create a payment
 *   - GET   {API_URL}/merchant/payment/{id}/status → poll until isFinal
 *   - POST  {API_URL}/payments/{id}/cancel         → cancel a pending payment
 *
 * The deposit is created when the user confirms an amount; the returned
 * `gatewayUrl` is the branded checkout (BX) link the payer opens / scans, and
 * the status poll drives the deposit to completion.
 *
 * Credentials come from .env (reused from merchant-pos-app). Note: browsers may
 * block direct calls to the Pay API via CORS — the POS demo proxies web calls
 * through a serverless function for that reason. On native this calls the API
 * directly.
 */

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const API_KEY = process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY ?? '';
const MERCHANT_ID = process.env.EXPO_PUBLIC_DEPOSIT_MERCHANT_ID ?? '';

const USD_UNIT = 'iso4217/USD';
const DEFAULT_POLL_MS = 2000;
const REQUEST_TIMEOUT_MS = 30000;

export type PaymentStatus =
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface StartPaymentRequest {
  referenceId: string;
  amount: { value: string; unit: string };
}

export interface StartPaymentResponse {
  paymentId: string;
  expiresAt: number | null;
  gatewayUrl: string;
  // Also returned on creation, mirroring the status response.
  status?: PaymentStatus;
  isFinal?: boolean;
  pollInMs?: number;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  isFinal: boolean;
  pollInMs: number;
}

export class PayConfigError extends Error {}

/** Convert a dollar string to integer cents (Stripe-style, avoids fp drift). */
export function amountToCents(amount: string): number {
  return Math.round(parseFloat(amount) * 100);
}

/** referenceId: a uuid-like hex string with no dashes, like the POS demo. */
function generateReferenceId(): string {
  const bytes = new Uint8Array(16);
  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function headers(): Record<string, string> {
  if (!API_URL) throw new PayConfigError('EXPO_PUBLIC_API_URL is not configured');
  if (!API_KEY) throw new PayConfigError('EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY is not configured');
  if (!MERCHANT_ID) {
    throw new PayConfigError(
      'EXPO_PUBLIC_DEPOSIT_MERCHANT_ID is not configured (the faucet merchant the deposit settles to)',
    );
  }
  return {
    'Content-Type': 'application/json',
    'Api-Key': API_KEY,
    'Merchant-Id': MERCHANT_ID,
    'WCP-Version': '2026-02-19.preview',
    'Sdk-Name': 'deposit-app',
    'Sdk-Version': '1.0.0',
    'Sdk-Platform': 'react-native',
  };
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...headers(), ...(init.headers ?? {}) },
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message || `Pay API error (status ${res.status})`,
      );
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** Create a deposit payment for a dollar amount. */
export function startPayment(amount: string): Promise<StartPaymentResponse> {
  const body: StartPaymentRequest = {
    referenceId: generateReferenceId(),
    amount: { value: String(amountToCents(amount)), unit: USD_UNIT },
  };
  return request<StartPaymentResponse>('/merchant/payment', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  return request<PaymentStatusResponse>(`/merchant/payment/${paymentId}/status`, {
    method: 'GET',
  });
}

export function cancelPayment(paymentId: string): Promise<void> {
  return request<void>(`/payments/${paymentId}/cancel`, { method: 'POST', body: '{}' });
}

/** Normalize the poll interval, defaulting when the server omits a sane value. */
export function nextPollMs(res: PaymentStatusResponse | null): number {
  const ms = res?.pollInMs;
  return typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms : DEFAULT_POLL_MS;
}
