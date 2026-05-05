import type {
  Action,
  PaymentOption,
  PaymentOptionsResponse,
} from '@walletconnect/pay';

jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  serializeError: jest.fn((error: unknown) =>
    error instanceof Error ? { message: error.message } : String(error),
  ),
}));

jest.mock('../src/store/SettingsStore', () => ({
  __esModule: true,
  default: {
    state: {
      eip155Address: '0xabc',
    },
  },
}));

jest.mock('../src/utils/WalletKitUtil', () => ({
  __esModule: true,
  walletKit: {
    pay: {
      getRequiredPaymentActions: jest.fn(),
      confirmPayment: jest.fn(),
    },
  },
}));

jest.mock('../src/utils/EIP155WalletUtil', () => ({
  __esModule: true,
  eip155Wallets: {
    '0xabc': {
      _signTypedData: jest.fn(),
      connect: jest.fn(),
    },
  },
}));

jest.mock('../src/utils/PaymentTransactionUtil', () => ({
  __esModule: true,
  estimateTransactionFee: jest.fn(),
  sendTransactionWithFreshFees: jest.fn(),
  waitForTransactionConfirmation: jest.fn(),
}));

jest.mock('../src/utils/storage', () => ({
  __esModule: true,
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import PaymentStore from '../src/store/PaymentStore';
import { EIP155_SIGNING_METHODS } from '../src/constants/Eip155';
import { walletKit } from '../src/utils/WalletKitUtil';
import { eip155Wallets } from '../src/utils/EIP155WalletUtil';
import { storage } from '../src/utils/storage';
import {
  estimateTransactionFee,
  sendTransactionWithFreshFees,
  waitForTransactionConfirmation,
} from '../src/utils/PaymentTransactionUtil';

const mockedEstimateTransactionFee = jest.mocked(estimateTransactionFee);
const mockedSendTransactionWithFreshFees = jest.mocked(
  sendTransactionWithFreshFees,
);
const mockedWaitForTransactionConfirmation = jest.mocked(
  waitForTransactionConfirmation,
);
const mockedGetRequiredPaymentActions = jest.mocked(
  walletKit.pay.getRequiredPaymentActions,
);
const mockedConfirmPayment = jest.mocked(walletKit.pay.confirmPayment);
const mockedWallet = eip155Wallets['0xabc'];
const mockedSignTypedData = jest.mocked(mockedWallet._signTypedData);
const mockedStorageGetItem = jest.mocked(storage.getItem);
const mockedStorageSetItem = jest.mocked(storage.setItem);
const mockedStorageRemoveItem = jest.mocked(storage.removeItem);

function createAction(method: string, params: unknown[] = []): Action {
  return {
    walletRpc: {
      chainId: 'eip155:137',
      method,
      params: JSON.stringify(params),
    },
  };
}

function createOption(overrides: Partial<PaymentOption> = {}): PaymentOption {
  return {
    id: 'option-1',
    account: 'eip155:137:0xabc',
    amount: {
      unit: 'caip19/eip155:137/erc20:0x1',
      value: '10000',
      display: {
        assetSymbol: 'USDC',
        assetName: 'USD Coin',
        decimals: 6,
        networkName: 'Polygon',
        iconUrl: 'https://example.com/usdc.png',
        networkIconUrl: 'https://example.com/polygon.png',
      },
    },
    etaS: 5,
    actions: [],
    ...overrides,
  };
}

function createPaymentOptions(
  optionOverrides: Array<Partial<PaymentOption>>,
): PaymentOptionsResponse {
  return {
    paymentId: 'payment-1',
    info: {
      status: 'requires_action',
      amount: {
        unit: 'iso4217/USD',
        value: '1',
        display: {
          assetSymbol: 'USD',
          assetName: 'US Dollar',
          decimals: 2,
        },
      },
      expiresAt: Math.floor(Date.now() / 1000) + 600,
      merchant: {
        name: 'Cafe Ivan',
        iconUrl: 'https://example.com/merchant.png',
      },
    },
    options: optionOverrides.map(overrides => createOption(overrides)),
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('PaymentStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PaymentStore.reset();

    mockedEstimateTransactionFee.mockResolvedValue({
      display: '$0.01',
      nativeDisplay: '0.0012 POL',
      fiatValue: 0.01,
      fiatCurrency: 'USD',
      chainId: 'eip155:137',
      nativeSymbol: 'POL',
    });
    mockedGetRequiredPaymentActions.mockResolvedValue([
      createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4, [
        '0xabc',
        JSON.stringify({
          domain: {},
          types: {
            EIP712Domain: [],
            PermitTransferFrom: [],
          },
          message: {},
        }),
      ]),
    ]);
    mockedConfirmPayment.mockResolvedValue({
      status: 'succeeded',
      isFinal: true,
    } as any);
    mockedSendTransactionWithFreshFees.mockResolvedValue({
      hash: '0xhash',
      wait: jest.fn(),
    } as any);
    mockedWaitForTransactionConfirmation.mockResolvedValue(undefined);
    mockedSignTypedData.mockResolvedValue('0xsigned');
    mockedStorageGetItem.mockResolvedValue(undefined);
    mockedStorageSetItem.mockResolvedValue(undefined as any);
    mockedStorageRemoveItem.mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    PaymentStore.reset();
  });

  it('starts per-option estimation when payment options load and does not fetch required actions', async () => {
    const paymentOptions = createPaymentOptions([
      {
        id: 'approval-option',
        actions: [
          createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
            { from: '0xabc', to: '0xdef', data: '0x' },
          ]),
          createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4),
        ],
      },
      {
        id: 'signature-option',
        actions: [createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4)],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);

    expect(
      PaymentStore.state.optionFeeEstimateStatusById['approval-option'],
    ).toBe('loading');
    expect(mockedGetRequiredPaymentActions).not.toHaveBeenCalled();

    await flushPromises();

    expect(mockedEstimateTransactionFee).toHaveBeenCalledTimes(1);
    expect(
      PaymentStore.state.optionFeeEstimatesById['approval-option'],
    ).toMatchObject({
      display: '$0.01',
      nativeDisplay: '0.0012 POL',
      fiatValue: 0.01,
      fiatCurrency: 'USD',
    });
    expect(
      PaymentStore.state.optionFeeEstimateStatusById['approval-option'],
    ).toBe('ready');
    expect(
      PaymentStore.state.optionFeeEstimatesById['signature-option'],
    ).toBeUndefined();
    expect(
      PaymentStore.state.optionFeeEstimateStatusById['signature-option'],
    ).toBe('ready');
  });

  it('does not fetch required actions when selecting an option', async () => {
    const paymentOptions = createPaymentOptions([
      {
        id: 'approval-option',
        actions: [
          createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
            { from: '0xabc', to: '0xdef', data: '0x' },
          ]),
        ],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);

    await flushPromises();

    expect(mockedGetRequiredPaymentActions).not.toHaveBeenCalled();
    expect(PaymentStore.state.selectedOption?.id).toBe('approval-option');
  });

  it('fetches required actions only when approving the payment', async () => {
    const paymentOptions = createPaymentOptions([
      {
        id: 'signature-option',
        actions: [createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4)],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);

    await flushPromises();
    await PaymentStore.approvePayment();

    expect(mockedGetRequiredPaymentActions).toHaveBeenCalledWith({
      paymentId: 'payment-1',
      optionId: 'signature-option',
    });
    expect(mockedConfirmPayment).toHaveBeenCalledWith({
      paymentId: 'payment-1',
      optionId: 'signature-option',
      signatures: ['0xsigned'],
    });
    expect(mockedStorageSetItem).toHaveBeenCalledWith(
      'PAY_LAST_TOKEN_UNIT',
      'caip19/eip155:137/erc20:0x1',
    );
    expect(PaymentStore.state.resultStatus).toBe('success');
  });

  it('replaces the stored token unit after a later successful payment', async () => {
    const usdcOptions = createPaymentOptions([
      {
        id: 'usdc-option',
        amount: {
          unit: 'caip19/eip155:137/erc20:0xUSDC',
          value: '10000',
          display: {
            assetSymbol: 'USDC',
            assetName: 'USD Coin',
            decimals: 6,
            networkName: 'Polygon',
            iconUrl: 'https://example.com/usdc.png',
            networkIconUrl: 'https://example.com/polygon.png',
          },
        } as PaymentOption['amount'],
        actions: [createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4)],
      },
    ]);

    PaymentStore.setPaymentOptions(usdcOptions);
    PaymentStore.selectOption(usdcOptions.options[0]);
    await flushPromises();
    await PaymentStore.approvePayment();

    const usdtOptions = createPaymentOptions([
      {
        id: 'usdt-option',
        amount: {
          unit: 'caip19/eip155:137/erc20:0xUSDT',
          value: '10000',
          display: {
            assetSymbol: 'USDT',
            assetName: 'Tether USD',
            decimals: 6,
            networkName: 'Polygon',
            iconUrl: 'https://example.com/usdt.png',
            networkIconUrl: 'https://example.com/polygon.png',
          },
        } as PaymentOption['amount'],
        actions: [createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4)],
      },
    ]);

    PaymentStore.setPaymentOptions(usdtOptions);
    PaymentStore.selectOption(usdtOptions.options[0]);
    await flushPromises();
    await PaymentStore.approvePayment();

    expect(mockedStorageSetItem).toHaveBeenNthCalledWith(
      1,
      'PAY_LAST_TOKEN_UNIT',
      'caip19/eip155:137/erc20:0xUSDC',
    );
    expect(mockedStorageSetItem).toHaveBeenNthCalledWith(
      2,
      'PAY_LAST_TOKEN_UNIT',
      'caip19/eip155:137/erc20:0xUSDT',
    );
  });

  it('finds preferred option by exact token unit match', () => {
    const options = createPaymentOptions([
      {
        id: 'usdc',
        amount: {
          unit: 'caip19/eip155:137/erc20:0xUSDC',
          value: '10000',
          display: {
            assetSymbol: 'USDC',
            assetName: 'USD Coin',
            decimals: 6,
            networkName: 'Polygon',
            iconUrl: 'https://example.com/usdc.png',
            networkIconUrl: 'https://example.com/polygon.png',
          },
        } as PaymentOption['amount'],
      },
      {
        id: 'usdt',
        amount: {
          unit: 'caip19/eip155:137/erc20:0xUSDT',
          value: '10000',
          display: {
            assetSymbol: 'USDT',
            assetName: 'Tether USD',
            decimals: 6,
            networkName: 'Polygon',
            iconUrl: 'https://example.com/usdt.png',
            networkIconUrl: 'https://example.com/polygon.png',
          },
        } as PaymentOption['amount'],
      },
    ]).options;

    const preferred = PaymentStore.findPreferredOption(
      options,
      'caip19/eip155:137/erc20:0xUSDT',
    );

    expect(preferred?.id).toBe('usdt');
  });

  it('loads and clears the last paid token preference', async () => {
    mockedStorageGetItem.mockResolvedValue('caip19/eip155:137/erc20:0xUSDT');

    const loaded = await PaymentStore.loadLastPaidTokenUnit();
    expect(loaded).toBe('caip19/eip155:137/erc20:0xUSDT');

    await PaymentStore.clearLastPaidTokenUnit();
    expect(mockedStorageRemoveItem).toHaveBeenCalledWith('PAY_LAST_TOKEN_UNIT');
  });

  it('keeps the default processing message for single-step typed-data payments', async () => {
    mockedSignTypedData.mockImplementation(async () => {
      expect(PaymentStore.state.loadingMessage).toBeNull();
      return '0xsigned';
    });

    const paymentOptions = createPaymentOptions([
      {
        id: 'single-step-option',
        actions: [createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4)],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);

    await flushPromises();
    await PaymentStore.approvePayment();

    expect(mockedGetRequiredPaymentActions).toHaveBeenCalledWith({
      paymentId: 'payment-1',
      optionId: 'single-step-option',
    });
    expect(mockedStorageSetItem).toHaveBeenCalledWith(
      'PAY_LAST_TOKEN_UNIT',
      'caip19/eip155:137/erc20:0x1',
    );
    expect(PaymentStore.state.resultStatus).toBe('success');
  });

  it('keeps the default processing message for single-step send-transaction payments', async () => {
    const deferredActions = createDeferred<Action[]>();
    mockedGetRequiredPaymentActions.mockImplementationOnce(
      () => deferredActions.promise,
    );
    mockedSendTransactionWithFreshFees.mockImplementation(async () => {
      expect(PaymentStore.state.loadingMessage).toBeNull();
      expect(PaymentStore.state.loadingNote).toBeNull();
      return {
        hash: '0xhash',
        wait: jest.fn(),
      } as any;
    });

    const paymentOptions = createPaymentOptions([
      {
        id: 'single-step-sendtx-option',
        actions: [
          createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
            { from: '0xabc', to: '0xdef', value: '0x1' },
          ]),
        ],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);
    await flushPromises();

    const approvePromise = PaymentStore.approvePayment();

    expect(PaymentStore.state.step).toBe('confirming');
    expect(PaymentStore.state.loadingMessage).toBeNull();
    expect(PaymentStore.state.loadingNote).toBeNull();

    deferredActions.resolve([
      createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
        { from: '0xabc', to: '0xdef', value: '0x1' },
      ]),
    ]);

    await approvePromise;

    expect(mockedConfirmPayment).toHaveBeenCalledWith({
      paymentId: 'payment-1',
      optionId: 'single-step-sendtx-option',
      signatures: [],
    });
    expect(PaymentStore.state.resultStatus).toBe('success');
  });

  it('does not set a finalizing message for multi-step approval flows', async () => {
    mockedGetRequiredPaymentActions.mockResolvedValue([
      createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
        { from: '0xabc', to: '0xdef', data: '0x' },
      ]),
      createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4, [
        '0xabc',
        JSON.stringify({
          domain: {},
          types: {
            EIP712Domain: [],
            PermitTransferFrom: [],
          },
          message: {},
        }),
      ]),
    ]);

    mockedSignTypedData.mockImplementation(async () => {
      expect(PaymentStore.state.loadingMessage).toBeNull();
      return '0xsigned';
    });

    const paymentOptions = createPaymentOptions([
      {
        id: 'approval-option',
        actions: [
          createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
            { from: '0xabc', to: '0xdef', data: '0x' },
          ]),
          createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4),
        ],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);

    await flushPromises();
    await PaymentStore.approvePayment();

    expect(PaymentStore.state.resultStatus).toBe('success');
  });

  it('starts confirming with setup message for approval options before actions fetch resolves', async () => {
    const deferredActions = createDeferred<Action[]>();
    mockedGetRequiredPaymentActions.mockImplementationOnce(
      () => deferredActions.promise,
    );

    const paymentOptions = createPaymentOptions([
      {
        id: 'approval-option',
        amount: {
          unit: 'caip19/eip155:137/erc20:0x1',
          value: '10000',
          display: {
            assetSymbol: 'USDT',
            assetName: 'Tether USD',
            decimals: 6,
            networkName: 'Polygon',
            iconUrl: 'https://example.com/usdt.png',
            networkIconUrl: 'https://example.com/polygon.png',
          },
        } as PaymentOption['amount'],
        actions: [
          createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
            { from: '0xabc', to: '0xdef', data: '0x' },
          ]),
          createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4),
        ],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);
    await flushPromises();

    const approvePromise = PaymentStore.approvePayment();

    expect(PaymentStore.state.step).toBe('confirming');
    expect(PaymentStore.state.loadingMessage).toBe(
      'Setting up USDT for one-time setup...',
    );
    expect(PaymentStore.state.loadingNote).toBe(
      'Future USDT payments will be instant',
    );

    deferredActions.resolve([
      createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
        { from: '0xabc', to: '0xdef', data: '0x' },
      ]),
      createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4, [
        '0xabc',
        JSON.stringify({
          domain: {},
          types: {
            EIP712Domain: [],
            PermitTransferFrom: [],
          },
          message: {},
        }),
      ]),
    ]);

    await approvePromise;
    expect(mockedStorageSetItem).toHaveBeenCalledWith(
      'PAY_LAST_TOKEN_UNIT',
      'caip19/eip155:137/erc20:0x1',
    );
    expect(PaymentStore.state.resultStatus).toBe('success');
  });

  it('allows pay to succeed even if approval fee estimation fails', async () => {
    mockedEstimateTransactionFee.mockRejectedValueOnce(
      new Error('estimate failed'),
    );
    mockedGetRequiredPaymentActions.mockResolvedValue([
      createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4, [
        '0xabc',
        JSON.stringify({
          domain: {},
          types: {
            EIP712Domain: [],
            ReceiveWithAuthorization: [],
          },
          message: {},
        }),
      ]),
    ]);

    const paymentOptions = createPaymentOptions([
      {
        id: 'approval-option',
        actions: [
          createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION, [
            { from: '0xabc', to: '0xdef', data: '0x' },
          ]),
          createAction(EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4),
        ],
      },
    ]);

    PaymentStore.setPaymentOptions(paymentOptions);
    PaymentStore.selectOption(paymentOptions.options[0]);

    await flushPromises();

    expect(
      PaymentStore.state.optionFeeEstimateStatusById['approval-option'],
    ).toBe('error');

    await PaymentStore.approvePayment();

    expect(mockedGetRequiredPaymentActions).toHaveBeenCalledWith({
      paymentId: 'payment-1',
      optionId: 'approval-option',
    });
    expect(mockedConfirmPayment).toHaveBeenCalled();
    expect(mockedStorageSetItem).toHaveBeenCalledWith(
      'PAY_LAST_TOKEN_UNIT',
      'caip19/eip155:137/erc20:0x1',
    );
    expect(PaymentStore.state.resultStatus).toBe('success');
  });
});
