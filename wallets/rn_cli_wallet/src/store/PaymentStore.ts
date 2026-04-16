import { proxy, ref } from 'valtio';
import type {
  Action,
  PaymentOptionsResponse,
  PaymentOption,
} from '@walletconnect/pay';
import { BigNumber, providers, utils } from 'ethers';
import Config from 'react-native-config';

import LogStore, { serializeError } from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import { revokePermit2ApprovalForTesting } from '@/utils/Permit2RevokeUtil';
import type { Step } from '@/utils/TypesUtil';
import { PresetsUtil } from '@/utils/PresetsUtil';
import {
  detectErrorType,
  getErrorMessage,
  formatAmount,
} from '@/modals/PaymentOptionsModal/utils';
import type { ErrorType } from '@/modals/PaymentOptionsModal/utils';
import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';

/**
 * Types
 */
interface PaymentState {
  paymentOptions: PaymentOptionsResponse | null;
  loadingMessage: string | null;
  errorMessage: string | null;
  step: Step;

  // Result state
  resultStatus: 'success' | 'error';
  resultMessage: string;
  resultErrorType: ErrorType | null;

  // Payment state
  selectedOption: PaymentOption | null;
  paymentActions: Action[] | null;
  isLoadingActions: boolean;
  isEstimatingApprovalGas: boolean;
  actionsError: string | null;
  approvalGasEstimate: string | null;
  isRevokingPermit: boolean;
  collectDataCompletedIds: string[];

  // Expiry
  expiresAt: number | null;
}

/**
 * Initial State
 */
const initialState: PaymentState = {
  paymentOptions: null,
  loadingMessage: null,
  errorMessage: null,
  step: 'loading',
  resultStatus: 'success',
  resultMessage: '',
  resultErrorType: null,
  selectedOption: null,
  paymentActions: null,
  isLoadingActions: false,
  isEstimatingApprovalGas: false,
  actionsError: null,
  approvalGasEstimate: null,
  isRevokingPermit: false,
  collectDataCompletedIds: [],
  expiresAt: null,
};

/**
 * State
 */
const state = proxy<PaymentState>({ ...initialState });

let expiryTimerId: ReturnType<typeof setTimeout> | null = null;
let paymentActionsRequestSeq = 0;

// --- Constants ---

const POLYGON_MIN_PRIORITY_FEE_WEI = BigNumber.from('30000000000'); // 30 gwei
const WALLETCONNECT_RPC_BASE_URL = 'https://rpc.walletconnect.org/v1/';
const PAY_EXPIRY_GUARD_MS = 10_000;
const TX_CONFIRMATION_TIMEOUT_MS = 120_000;
const NATIVE_SYMBOL_BY_CHAIN_ID: Record<string, string> = {
  'eip155:1': 'ETH',
  'eip155:5': 'ETH',
  'eip155:10': 'ETH',
  'eip155:11155420': 'ETH',
  'eip155:42161': 'ETH',
  'eip155:8453': 'ETH',
  'eip155:1313161554': 'ETH',
  'eip155:7777777': 'ETH',
  'eip155:137': 'MATIC',
  'eip155:80001': 'MATIC',
  'eip155:56': 'BNB',
  'eip155:43114': 'AVAX',
  'eip155:43113': 'AVAX',
  'eip155:250': 'FTM',
  'eip155:100': 'XDAI',
  'eip155:9001': 'EVMOS',
  'eip155:324': 'ETH',
  'eip155:314': 'FIL',
  'eip155:4689': 'IOTX',
  'eip155:1088': 'METIS',
  'eip155:1284': 'GLMR',
  'eip155:1285': 'MOVR',
  'eip155:42220': 'CELO',
  'eip155:143': 'MON',
};

// --- Fee & RPC helpers ---

function getWalletConnectRpcUrl(chainId: string): string | null {
  const projectId = Config.ENV_PROJECT_ID?.trim();
  if (!projectId) {
    return null;
  }
  return `${WALLETCONNECT_RPC_BASE_URL}?chainId=${encodeURIComponent(chainId)}&projectId=${encodeURIComponent(projectId)}`;
}

function getHighestBigNumber(
  values: Array<BigNumber | null | undefined>,
): BigNumber | null {
  return values.reduce<BigNumber | null>((max, v) => {
    if (!v) return max;
    return !max || v.gt(max) ? v : max;
  }, null);
}

function toBigNumber(value: unknown): BigNumber | null {
  if (value == null) return null;
  try {
    return BigNumber.from(value as string | number);
  } catch {
    return null;
  }
}

function parseWalletRpcParams(params: unknown): unknown[] | null {
  if (Array.isArray(params)) {
    return params;
  }
  if (typeof params !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(params);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getApprovalAction(actions: Action[] | null): Action | null {
  return (
    actions?.find(
      action =>
        action.walletRpc?.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    ) || null
  );
}

function isPaymentExpiredLocally(expiresAt: number | null): boolean {
  if (!expiresAt) return false;
  const expiresAtMs = expiresAt * 1000;
  return Date.now() + PAY_EXPIRY_GUARD_MS >= expiresAtMs;
}

function buildFreshTxRequest({
  chainId,
  baseTx,
  feeData,
  latestBlock,
}: {
  chainId: string;
  baseTx: providers.TransactionRequest;
  feeData: providers.FeeData;
  latestBlock: providers.Block;
}): providers.TransactionRequest {
  const chainFloor =
    chainId === 'eip155:137' ? POLYGON_MIN_PRIORITY_FEE_WEI : null;
  const priorityFee = getHighestBigNumber([
    chainFloor,
    feeData.maxPriorityFeePerGas || null,
  ]);

  const maxFee = priorityFee
    ? getHighestBigNumber([
        latestBlock.baseFeePerGas
          ? latestBlock.baseFeePerGas.mul(2).add(priorityFee)
          : null,
        feeData.maxFeePerGas || null,
        priorityFee,
      ])
    : null;

  const request: providers.TransactionRequest = { ...baseTx };

  if (priorityFee) {
    request.maxPriorityFeePerGas = priorityFee;
  } else {
    delete request.maxPriorityFeePerGas;
  }

  if (maxFee) {
    request.maxFeePerGas = maxFee;
  } else {
    delete request.maxFeePerGas;
  }

  if (
    !request.maxPriorityFeePerGas &&
    !request.maxFeePerGas &&
    feeData.gasPrice
  ) {
    const gasPrice = getHighestBigNumber([
      feeData.gasPrice,
      chainFloor,
    ]);
    if (gasPrice) {
      request.gasPrice = gasPrice;
    }
  } else {
    delete request.gasPrice;
  }

  return request;
}

function serializeTxRequestForLog(tx: providers.TransactionRequest) {
  const asString = (value: unknown): string | number | null => {
    if (value == null) return null;
    if (BigNumber.isBigNumber(value)) return value.toString();
    if (typeof value === 'number' || typeof value === 'string') return value;
    if (typeof value === 'object' && 'toString' in value) {
      try {
        return (value as { toString: () => string }).toString();
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    from: tx.from ?? null,
    to: tx.to ?? null,
    nonce: tx.nonce ?? null,
    type: tx.type ?? null,
    value: asString(tx.value),
    gasLimit: asString(tx.gasLimit),
    gasPrice: asString(tx.gasPrice),
    maxFeePerGas: asString(tx.maxFeePerGas),
    maxPriorityFeePerGas: asString(tx.maxPriorityFeePerGas),
    dataLength:
      typeof tx.data === 'string' ? Math.max(0, (tx.data.length - 2) / 2) : null,
  };
}

function formatGasEstimate({
  totalFeeWei,
  chainId,
}: {
  totalFeeWei: BigNumber;
  chainId: string;
}): string {
  const symbol = NATIVE_SYMBOL_BY_CHAIN_ID[chainId] || 'ETH';
  const feeValue = Number(utils.formatEther(totalFeeWei));
  if (!Number.isFinite(feeValue) || feeValue <= 0) {
    return `~${utils.formatEther(totalFeeWei)} ${symbol}`;
  }

  if (feeValue >= 0.01) {
    return `~${feeValue.toFixed(4)} ${symbol}`;
  }
  return `~${feeValue.toFixed(6)} ${symbol}`;
}

async function estimateApprovalGasCost(action: Action): Promise<string | null> {
  const { walletRpc } = action;
  if (!walletRpc?.params) {
    return null;
  }

  const parsedParams = parseWalletRpcParams(walletRpc.params);
  if (!parsedParams?.[0] || typeof parsedParams[0] !== 'object') {
    return null;
  }

  const chainId = walletRpc.chainId;
  const chainData = PresetsUtil.getChainDataById(chainId);
  if (!chainData) {
    return null;
  }

  const rpcUrl = getWalletConnectRpcUrl(chainId);
  if (!rpcUrl) {
    return null;
  }

  const parsedChainId = Number(chainData.chainId);
  const network =
    Number.isFinite(parsedChainId) && parsedChainId > 0
      ? { chainId: parsedChainId, name: chainData.name || chainId }
      : undefined;
  const provider = network
    ? new providers.StaticJsonRpcProvider(rpcUrl, network)
    : new providers.StaticJsonRpcProvider(rpcUrl);

  const baseTx: providers.TransactionRequest = {
    ...(parsedParams[0] as providers.TransactionRequest),
  };
  const [gasLimit, feeData, latestBlock] = await Promise.all([
    provider.estimateGas(baseTx),
    provider.getFeeData(),
    provider.getBlock('latest'),
  ]);
  const txWithFreshFees = buildFreshTxRequest({
    chainId,
    baseTx,
    feeData,
    latestBlock,
  });
  const feePerGas = toBigNumber(
    txWithFreshFees.maxFeePerGas ??
      txWithFreshFees.gasPrice ??
      feeData.maxFeePerGas ??
      feeData.gasPrice,
  );
  if (!feePerGas) {
    return null;
  }

  const totalFeeWei = gasLimit.mul(feePerGas);
  return formatGasEstimate({ totalFeeWei, chainId });
}

// --- Shared transaction sender with fresh fee enrichment ---

async function sendTransaction({
  chainId,
  baseTx,
  wallet,
  logContext,
}: {
  chainId: string;
  baseTx: providers.TransactionRequest;
  wallet: { connect: (provider: providers.JsonRpcProvider) => providers.JsonRpcSigner | { sendTransaction: (tx: providers.TransactionRequest) => Promise<providers.TransactionResponse> } };
  logContext: string;
}): Promise<providers.TransactionResponse> {
  const chainData = PresetsUtil.getChainDataById(chainId);
  if (!chainData) {
    throw new Error(`Missing chain metadata for ${chainId}`);
  }
  const rpcUrl = getWalletConnectRpcUrl(chainId);
  if (!rpcUrl) {
    throw new Error(
      `Missing ENV_PROJECT_ID for WalletConnect RPC on chain ${chainId}`,
    );
  }

  const parsedChainId = Number(chainData.chainId);
  const network =
    Number.isFinite(parsedChainId) && parsedChainId > 0
      ? { chainId: parsedChainId, name: chainData.name || chainId }
      : undefined;
  const provider = network
    ? new providers.StaticJsonRpcProvider(rpcUrl, network)
    : new providers.StaticJsonRpcProvider(rpcUrl);
  const connectedWallet = wallet.connect(provider);

  // Fetch fee data before transaction attempt
  let txRequest: providers.TransactionRequest = { ...baseTx };
  try {
    const [feeData, latestBlock] = await Promise.all([
      provider.getFeeData(),
      provider.getBlock('latest'),
    ]);
    txRequest = buildFreshTxRequest({
      chainId,
      baseTx,
      feeData,
      latestBlock,
    });
  } catch (error) {
    LogStore.warn(
      'Failed to fetch initial fee data',
      'PaymentStore',
      logContext,
      { chainId, error: serializeError(error) },
    );
  }

  LogStore.log('Submitting transaction', 'PaymentStore', logContext, {
    chainId,
    tx: serializeTxRequestForLog(txRequest),
  });

  try {
    return await connectedWallet.sendTransaction(txRequest);
  } catch (error) {
    LogStore.error('Transaction submission failed', 'PaymentStore', logContext, {
      chainId,
      tx: serializeTxRequestForLog(txRequest),
      error: serializeError(error),
    });
    throw error;
  }
}

async function waitForTransactionConfirmation(
  tx: providers.TransactionResponse,
  timeoutMs: number = TX_CONFIRMATION_TIMEOUT_MS,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    await Promise.race([
      tx.wait(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new Error(
              `Transaction confirmation timed out after ${timeoutMs}ms`,
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Store / Actions
 */
const PaymentStore = {
  state,

  // --- Flow lifecycle ---

  startPayment(params: {
    paymentOptions?: PaymentOptionsResponse;
    loadingMessage?: string;
    errorMessage?: string;
  }) {
    PaymentStore.clearExpiryTimer();
    Object.assign(state, { ...initialState });
    if (params.paymentOptions) {
      state.paymentOptions = ref(params.paymentOptions);
    }
    state.loadingMessage = params.loadingMessage ?? null;
    state.errorMessage = params.errorMessage ?? null;
  },

  setPaymentOptions(options: PaymentOptionsResponse) {
    state.paymentOptions = ref(options);
    state.loadingMessage = null;
    state.errorMessage = null;
    state.resultErrorType = null;

    const expiresAt = options.info?.expiresAt;
    if (typeof expiresAt === 'number' && expiresAt > 0) {
      state.expiresAt = expiresAt;
      PaymentStore.startExpiryTimer(expiresAt);
    } else {
      PaymentStore.clearExpiryTimer();
      state.expiresAt = null;
    }
  },

  setError(errorMessage: string) {
    const errorType = detectErrorType(errorMessage);
    state.errorMessage = errorMessage;
    state.loadingMessage = null;
    state.isRevokingPermit = false;
    state.resultStatus = 'error';
    state.resultMessage = getErrorMessage(errorType, errorMessage);
    state.resultErrorType = errorType;
    state.step = 'result';
  },

  reset() {
    PaymentStore.clearExpiryTimer();
    Object.assign(state, { ...initialState });
  },

  setStep(step: Step) {
    state.step = step;
  },

  setResult(payload: {
    status: 'success' | 'error';
    message: string;
    errorType?: ErrorType;
  }) {
    state.resultStatus = payload.status;
    state.resultMessage = payload.message;
    state.resultErrorType = payload.errorType ?? null;
    state.errorMessage = null;
    state.loadingMessage = null;
    state.isRevokingPermit = false;
    state.step = 'result';
  },

  selectOption(option: PaymentOption) {
    state.selectedOption = ref(option);
    state.paymentActions = null;
    state.actionsError = null;
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
  },

  clearSelectedOption() {
    state.selectedOption = null;
    state.paymentActions = null;
    state.actionsError = null;
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
    state.isRevokingPermit = false;
  },

  markCollectDataCompleted(optionId: string) {
    if (!state.collectDataCompletedIds.includes(optionId)) {
      state.collectDataCompletedIds.push(optionId);
    }
  },

  isCollectDataCompleted(optionId: string): boolean {
    return state.collectDataCompletedIds.includes(optionId);
  },

  setPaymentActions(actions: Action[]) {
    state.paymentActions = ref(actions);
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
  },

  setLoadingActions(loading: boolean) {
    state.isLoadingActions = loading;
  },

  setActionsError(error: string | null) {
    state.actionsError = error;
  },

  async revokePermit2Approval() {
    if (state.isRevokingPermit) return;

    state.isRevokingPermit = true;

    try {
      await revokePermit2ApprovalForTesting({
        paymentActions: state.paymentActions,
        selectedOption: state.selectedOption,
        wallet: eip155Wallets[SettingsStore.state.eip155Address],
        sendTransaction,
      });
    } finally {
      state.isRevokingPermit = false;
    }
  },

  // --- Expiry timer ---

  startExpiryTimer(expiresAt: number) {
    PaymentStore.clearExpiryTimer();
    const TWO_MINUTES_MS = 2 * 60 * 1000;
    const now = Date.now();
    const expiresAtMs = expiresAt * 1000;
    const warningTime = expiresAtMs - TWO_MINUTES_MS;
    const delay = warningTime - now;

    const interruptibleSteps: Step[] = [
      'selectOption',
      'review',
      'collectData',
      'infoExplainer',
    ];

    if (delay <= 0) {
      if (expiresAtMs > now && interruptibleSteps.includes(state.step)) {
        state.step = 'expiryWarning';
      }
      return;
    }

    expiryTimerId = setTimeout(() => {
      if (interruptibleSteps.includes(state.step)) {
        state.step = 'expiryWarning';
      }
    }, delay);
  },

  clearExpiryTimer() {
    if (expiryTimerId !== null) {
      clearTimeout(expiryTimerId);
      expiryTimerId = null;
    }
  },

  // --- Business logic ---

  async fetchPaymentActions(option: PaymentOption) {
    const payClient = walletKit?.pay;
    if (!payClient || !state.paymentOptions) {
      LogStore.error(
        'Pay SDK not initialized',
        'PaymentStore',
        'fetchPaymentActions',
      );
      state.actionsError = 'Pay SDK not initialized';
      return;
    }

    state.isLoadingActions = true;
    state.actionsError = null;
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
    const requestSeq = ++paymentActionsRequestSeq;
    const isStaleRequest = () =>
      requestSeq !== paymentActionsRequestSeq ||
      state.selectedOption?.id !== option.id;

    try {
      LogStore.log(
        'Getting required payment actions',
        'PaymentStore',
        'fetchPaymentActions',
        { optionId: option.id },
      );
      const actions = await payClient.getRequiredPaymentActions({
        paymentId: state.paymentOptions.paymentId,
        optionId: option.id,
      });
      LogStore.log(
        'Required actions received',
        'PaymentStore',
        'fetchPaymentActions',
        { actionsCount: actions.length },
      );
      if (isStaleRequest()) {
        LogStore.warn(
          'Skipping stale payment actions response',
          'PaymentStore',
          'fetchPaymentActions',
          { optionId: option.id },
        );
        return;
      }
      state.paymentActions = ref(actions);
      state.isLoadingActions = false;

      const approvalAction = getApprovalAction(actions);
      if (approvalAction) {
        state.isEstimatingApprovalGas = true;
        try {
          const estimate = await estimateApprovalGasCost(approvalAction);
          if (!isStaleRequest()) {
            state.approvalGasEstimate = estimate;
          }
          LogStore.log(
            'Approval gas estimate resolved',
            'PaymentStore',
            'fetchPaymentActions',
            {
              optionId: option.id,
              chainId: approvalAction.walletRpc?.chainId,
              estimate,
            },
          );
        } catch (error) {
          LogStore.warn(
            'Failed to estimate approval gas fee',
            'PaymentStore',
            'fetchPaymentActions',
            {
              optionId: option.id,
              chainId: approvalAction.walletRpc?.chainId,
              error: serializeError(error),
            },
          );
        } finally {
          if (!isStaleRequest()) {
            state.isEstimatingApprovalGas = false;
          }
        }
      }
    } catch (error: any) {
      if (isStaleRequest()) {
        LogStore.warn(
          'Skipping stale payment actions error',
          'PaymentStore',
          'fetchPaymentActions',
          { optionId: option.id, error: error?.message },
        );
        return;
      }
      LogStore.error(
        'Error getting payment actions',
        'PaymentStore',
        'fetchPaymentActions',
        { error: error?.message },
      );
      const errorMessage = error?.message || 'Failed to get payment actions';
      const errorType = detectErrorType(errorMessage);
      state.resultStatus = 'error';
      state.resultMessage = getErrorMessage(errorType, errorMessage);
      state.resultErrorType = errorType;
      state.step = 'result';
    } finally {
      if (requestSeq === paymentActionsRequestSeq && state.isLoadingActions) {
        state.isLoadingActions = false;
      }
    }
  },

  async approvePayment() {
    if (state.step === 'confirming') {
      LogStore.warn(
        'Payment already in progress',
        'PaymentStore',
        'approvePayment',
      );
      return;
    }

    const { paymentActions, selectedOption, paymentOptions, expiresAt } = state;
    if (!paymentActions?.length || !selectedOption || !paymentOptions) {
      LogStore.warn(
        'Cannot approve payment - missing required state',
        'PaymentStore',
        'approvePayment',
        {
          hasPaymentActions: !!paymentActions?.length,
          hasSelectedOption: !!selectedOption,
          hasPaymentData: !!paymentOptions,
        },
      );
      return;
    }

    if (isPaymentExpiredLocally(expiresAt)) {
      LogStore.warn(
        'Payment expired locally before approval',
        'PaymentStore',
        'approvePayment',
        {
          paymentId: paymentOptions.paymentId,
          expiresAt,
          now: Math.floor(Date.now() / 1000),
          guardMs: PAY_EXPIRY_GUARD_MS,
        },
      );
      PaymentStore.setResult({
        status: 'error',
        errorType: 'expired',
        message: getErrorMessage('expired'),
      });
      return;
    }

    state.step = 'confirming';
    state.actionsError = null;

    try {
      const payClient = walletKit?.pay;
      if (!payClient) {
        throw new Error('Pay SDK not available');
      }

      const wallet = eip155Wallets[SettingsStore.state.eip155Address];
      if (!wallet) {
        throw new Error('Wallet not found for selected EIP155 account');
      }

      const signatures: string[] = [];
      const totalActions = paymentActions.length;

      for (const [index, action] of paymentActions.entries()) {
        const stepLabel = `${index + 1}/${totalActions}`;
        const method = action.walletRpc?.method;

        if (!action.walletRpc) {
          throw new Error(`Payment action ${stepLabel} is missing walletRpc`);
        }

        LogStore.log('Executing payment action', 'PaymentStore', 'approvePayment', {
          step: stepLabel,
          method,
        });

        const { params, chainId } = action.walletRpc;
        let parsedParams: unknown;
        try {
          parsedParams =
            typeof params === 'string' ? JSON.parse(params) : params;
        } catch (error) {
          throw new Error(
            `Failed to parse params for ${method} (${stepLabel}): ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        if (!Array.isArray(parsedParams)) {
          throw new Error(
            `Invalid params for ${method} (${stepLabel}): expected array`,
          );
        }

        switch (method) {
          case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION: {
            const txPayload = parsedParams[0];
            if (!txPayload || typeof txPayload !== 'object') {
              throw new Error(`Invalid tx payload for ${method} (${stepLabel})`);
            }

            const baseTx: providers.TransactionRequest = { ...txPayload };

            const tx = await sendTransaction({
              chainId,
              baseTx,
              wallet,
              logContext: 'approvePayment',
            });

            try {
              await waitForTransactionConfirmation(tx);
            } catch (error) {
              LogStore.error(
                'Approval transaction confirmation failed',
                'PaymentStore',
                'approvePayment',
                {
                  chainId,
                  step: stepLabel,
                  txHash: tx.hash,
                  error: serializeError(error),
                },
              );
              throw new Error('Approval transaction confirmation failed');
            }

            LogStore.log(
              'Token approval transaction confirmed',
              'PaymentStore',
              'approvePayment',
              { chainId, step: stepLabel, txHash: tx.hash },
            );
            break;
          }

          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4: {
            let typedData: unknown = parsedParams[1];
            try {
              if (typeof typedData === 'string') typedData = JSON.parse(typedData);
            } catch (error) {
              throw new Error(
                `Failed to parse typed-data for ${method} (${stepLabel}): ${error instanceof Error ? error.message : String(error)}`,
              );
            }

            if (!typedData || typeof typedData !== 'object') {
              throw new Error(
                `Invalid typed-data for ${method} (${stepLabel})`,
              );
            }

            const { domain, types, message: messageData } = typedData as {
              domain: Record<string, unknown>;
              types: Record<string, Array<Record<string, unknown>>>;
              message: Record<string, unknown>;
            };

            if (!types || typeof types !== 'object') {
              throw new Error(
                `Typed-data missing types for ${method} (${stepLabel})`,
              );
            }

            delete types.EIP712Domain;

            const signature = await wallet._signTypedData(
              domain,
              types,
              messageData,
            );
            signatures.push(signature);
            break;
          }

          default:
            throw new Error(`Unsupported wallet RPC method: ${method}`);
        }
      }

      LogStore.log('Confirming payment', 'PaymentStore', 'approvePayment', {
        signaturesCount: signatures.length,
      });

      const confirmResult = await payClient.confirmPayment({
        paymentId: paymentOptions.paymentId,
        optionId: selectedOption.id,
        signatures,
      });

      LogStore.log(
        'Payment confirmation result',
        'PaymentStore',
        'approvePayment',
        { status: confirmResult?.status },
      );

      if (!confirmResult) {
        throw new Error('Payment confirmation failed - no response received');
      }

      if (confirmResult.status === 'expired') {
        PaymentStore.setResult({
          status: 'error',
          errorType: 'expired',
          message: getErrorMessage('expired'),
        });
        return;
      }

      if ((confirmResult.status as string) === 'cancelled') {
        PaymentStore.setResult({
          status: 'error',
          errorType: 'cancelled',
          message: getErrorMessage('cancelled'),
        });
        return;
      }

      const amount = formatAmount(
        selectedOption.amount.value,
        selectedOption.amount.display.decimals,
        2,
      );
      PaymentStore.setResult({
        status: 'success',
        message: `You've paid ${amount} ${selectedOption.amount.display.assetSymbol} to ${paymentOptions.info?.merchant?.name}`,
      });
    } catch (error: unknown) {
      LogStore.error(
        'Error executing payment actions',
        'PaymentStore',
        'approvePayment',
        { error: serializeError(error) },
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to execute payment actions';
      const errorType = detectErrorType(errorMessage);
      PaymentStore.setResult({
        status: 'error',
        errorType,
        message: getErrorMessage(errorType, errorMessage),
      });
    }
  },
};

export default PaymentStore;
