import type { ConfirmPaymentResponse } from '@walletconnect/pay';

import {
  ConfirmPaymentPollingTimeoutError,
  confirmPaymentWithPolling,
} from '../src/utils/PaymentConfirmUtil';

const CONFIRM_PARAMS = {
  paymentId: 'payment-id',
  optionId: 'option-id',
  signatures: ['0xsignature'],
};

describe('confirmPaymentWithPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('polls until the response becomes final', async () => {
    const confirm = jest
      .fn<Promise<ConfirmPaymentResponse>, [typeof CONFIRM_PARAMS]>()
      .mockResolvedValueOnce({
        status: 'processing',
        isFinal: false,
        pollInMs: 1000,
      })
      .mockResolvedValueOnce({
        status: 'succeeded',
        isFinal: true,
      });
    const onPending = jest.fn();

    const resultPromise = confirmPaymentWithPolling({
      confirm,
      params: CONFIRM_PARAMS,
      onPending,
    });

    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;
    expect(result.status).toBe('succeeded');
    expect(result.isFinal).toBe(true);
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(onPending).toHaveBeenCalledTimes(1);
  });

  it('throws a timeout error when finalization takes too long', async () => {
    const confirm = jest
      .fn<Promise<ConfirmPaymentResponse>, [typeof CONFIRM_PARAMS]>()
      .mockResolvedValue({
        status: 'processing',
        isFinal: false,
        pollInMs: 700,
      });

    const resultPromise = confirmPaymentWithPolling({
      confirm,
      params: CONFIRM_PARAMS,
      timeoutMs: 1000,
    });
    const rejection = resultPromise.then(
      () => {
        throw new Error('Expected promise to reject');
      },
      error => {
        expect(error).toBeInstanceOf(ConfirmPaymentPollingTimeoutError);
      },
    );

    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(700);

    await rejection;
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('returns immediately when the first response is final', async () => {
    const confirm = jest
      .fn<Promise<ConfirmPaymentResponse>, [typeof CONFIRM_PARAMS]>()
      .mockResolvedValue({
        status: 'failed',
        isFinal: true,
      });

    const result = await confirmPaymentWithPolling({
      confirm,
      params: CONFIRM_PARAMS,
    });

    expect(result.status).toBe('failed');
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});
