import type { Action } from '@walletconnect/pay';
import { BigNumber, providers, utils } from 'ethers';
import Config from 'react-native-config';

import LogStore, { serializeError } from '@/store/LogStore';
import { PresetsUtil } from '@/utils/PresetsUtil';

const POLYGON_MIN_PRIORITY_FEE_WEI = BigNumber.from('30000000000'); // 30 gwei
const WALLETCONNECT_RPC_BASE_URL = 'https://rpc.walletconnect.org/v1/';
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

export type TransactionWallet = {
  connect: (
    provider: providers.JsonRpcProvider,
  ) =>
    | providers.JsonRpcSigner
    | {
        sendTransaction: (
          tx: providers.TransactionRequest,
        ) => Promise<providers.TransactionResponse>;
      };
};

export function parseWalletRpcParams(params: unknown): unknown[] | null {
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

export function createPayRpcProvider(
  chainId: string,
): providers.StaticJsonRpcProvider {
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

  return network
    ? new providers.StaticJsonRpcProvider(rpcUrl, network)
    : new providers.StaticJsonRpcProvider(rpcUrl);
}

export function buildFreshTxRequest({
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
    const gasPrice = getHighestBigNumber([feeData.gasPrice, chainFloor]);
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
    if (typeof value === 'object' && value && 'toString' in value) {
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

export async function estimateTransactionFee(
  action: Action,
): Promise<string | null> {
  const { walletRpc } = action;
  if (!walletRpc?.params) {
    return null;
  }

  const parsedParams = parseWalletRpcParams(walletRpc.params);
  if (!parsedParams?.[0] || typeof parsedParams[0] !== 'object') {
    return null;
  }

  let provider: providers.StaticJsonRpcProvider;
  try {
    provider = createPayRpcProvider(walletRpc.chainId);
  } catch {
    return null;
  }

  const baseTx: providers.TransactionRequest = {
    ...(parsedParams[0] as providers.TransactionRequest),
  };

  const [gasLimit, feeData, latestBlock] = await Promise.all([
    provider.estimateGas(baseTx),
    provider.getFeeData(),
    provider.getBlock('latest'),
  ]);

  const txWithFreshFees = buildFreshTxRequest({
    chainId: walletRpc.chainId,
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
  return formatGasEstimate({ totalFeeWei, chainId: walletRpc.chainId });
}

export async function sendTransactionWithFreshFees({
  chainId,
  baseTx,
  wallet,
  logContext,
}: {
  chainId: string;
  baseTx: providers.TransactionRequest;
  wallet: TransactionWallet;
  logContext: string;
}): Promise<providers.TransactionResponse> {
  const provider = createPayRpcProvider(chainId);
  const connectedWallet = wallet.connect(provider);

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
      'PaymentTransactionUtil',
      logContext,
      { chainId, error: serializeError(error) },
    );
  }

  LogStore.log(
    'Submitting transaction',
    'PaymentTransactionUtil',
    logContext,
    {
      chainId,
      tx: serializeTxRequestForLog(txRequest),
    },
  );

  try {
    return await connectedWallet.sendTransaction(txRequest);
  } catch (error) {
    LogStore.error(
      'Transaction submission failed',
      'PaymentTransactionUtil',
      logContext,
      {
        chainId,
        tx: serializeTxRequestForLog(txRequest),
        error: serializeError(error),
      },
    );
    throw error;
  }
}

export async function waitForTransactionConfirmation(
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
