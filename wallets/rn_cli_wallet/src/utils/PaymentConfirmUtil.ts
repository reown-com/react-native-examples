import type {
  ConfirmPaymentParams,
  ConfirmPaymentResponse,
} from '@walletconnect/pay';

const DEFAULT_POLL_MS = 1_500;
const DEFAULT_TIMEOUT_MS = 45_000;

type ConfirmPaymentFn = (
  params: ConfirmPaymentParams,
) => Promise<ConfirmPaymentResponse>;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export class ConfirmPaymentPollingTimeoutError extends Error {
  readonly lastStatus: string;
  readonly elapsedMs: number;

  constructor(lastStatus: string, elapsedMs: number) {
    super('Payment confirmation polling timed out');
    this.name = 'ConfirmPaymentPollingTimeoutError';
    this.lastStatus = lastStatus;
    this.elapsedMs = elapsedMs;
  }
}

export async function confirmPaymentWithPolling({
  confirm,
  params,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fallbackPollMs = DEFAULT_POLL_MS,
  onPending,
}: {
  confirm: ConfirmPaymentFn;
  params: ConfirmPaymentParams;
  timeoutMs?: number;
  fallbackPollMs?: number;
  onPending?: (context: {
    attempt: number;
    response: ConfirmPaymentResponse;
    nextPollMs: number;
    elapsedMs: number;
  }) => void;
}): Promise<ConfirmPaymentResponse> {
  const startedAt = Date.now();
  let attempt = 1;
  let response = await confirm(params);

  while (!response.isFinal) {
    const elapsedMs = Date.now() - startedAt;
    const nextPollMs = Math.max(250, response.pollInMs ?? fallbackPollMs);

    if (elapsedMs + nextPollMs > timeoutMs) {
      throw new ConfirmPaymentPollingTimeoutError(response.status, elapsedMs);
    }

    onPending?.({
      attempt,
      response,
      nextPollMs,
      elapsedMs,
    });

    await sleep(nextPollMs);
    attempt += 1;
    response = await confirm(params);
  }

  return response;
}
