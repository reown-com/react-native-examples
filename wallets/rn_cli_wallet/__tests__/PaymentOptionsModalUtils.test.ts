import {
  getLoadingContent,
  getResultContent,
} from '../src/modals/PaymentOptionsModal/utils';

describe('getResultContent', () => {
  it('renders the success outcome with the dynamic summary', () => {
    const content = getResultContent('success', null, {
      message: "You've paid 5.00 USDT to Acme",
    });

    expect(content).toMatchObject({
      title: "You've paid 5.00 USDT to Acme",
      icon: 'success',
      iconTestId: 'pay-result-success-icon',
      actionLabel: 'Done',
      actionKind: 'close',
    });
    expect(content.description).toBeUndefined();
  });

  it('falls back to the default success title when no summary is given', () => {
    expect(getResultContent('success', null).title).toBe('Payment confirmed');
  });

  it('maps insufficient_funds to its title, description, icon and button', () => {
    const content = getResultContent('error', 'insufficient_funds');

    expect(content).toMatchObject({
      title: 'Not enough funds in your wallet',
      icon: 'coins',
      iconTestId: 'pay-result-insufficient-funds-icon',
      actionLabel: 'Got it',
      actionKind: 'close',
    });
    expect(content.description).toContain('Add funds, or pay');
  });

  it('routes expired and cancelled errors to the scan-QR action', () => {
    expect(getResultContent('error', 'expired')).toMatchObject({
      iconTestId: 'pay-result-expired-icon',
      actionLabel: 'Scan a new QR code',
      actionKind: 'scanQR',
    });
    expect(getResultContent('error', 'cancelled')).toMatchObject({
      iconTestId: 'pay-result-cancelled-icon',
      actionLabel: 'Scan a new QR code',
      actionKind: 'scanQR',
    });
  });

  it('uses the raw error message as the generic description, then a default', () => {
    expect(
      getResultContent('error', 'generic', { message: 'boom' }).description,
    ).toBe('boom');
    expect(getResultContent('error', 'generic').description).toContain(
      'No funds were moved',
    );
  });

  it('maps not_found to its title, description and close action', () => {
    const content = getResultContent('error', 'not_found');

    expect(content).toMatchObject({
      title: 'Payment request not found',
      iconTestId: 'pay-result-error-icon',
      actionLabel: 'Close',
      actionKind: 'close',
    });
    expect(content.description).toContain('isn’t valid');
  });

  it('treats an error with no classified type as generic', () => {
    expect(getResultContent('error', null)).toMatchObject({
      title: 'Payment didn’t go through',
      iconTestId: 'pay-result-error-icon',
      actionKind: 'close',
    });
  });
});

describe('getLoadingContent', () => {
  it('returns the step default with no note when nothing is being set up', () => {
    expect(getLoadingContent('loading')).toEqual({
      message: 'Preparing your payment…',
    });
    expect(getLoadingContent('confirming')).toEqual({
      message: 'Confirming your payment…',
    });
  });

  it('returns the token-setup message and note when a token is being set up', () => {
    expect(getLoadingContent('confirming', { setupTokenSymbol: 'USDT' })).toEqual(
      {
        message: 'Setting up USDT',
        note: 'This usually takes a few seconds. Future USDT payments will skip this step.',
      },
    );
  });

  it('lets the setup token take precedence over the step default', () => {
    expect(
      getLoadingContent('loading', { setupTokenSymbol: 'USDC' }).message,
    ).toBe('Setting up USDC');
  });
});
