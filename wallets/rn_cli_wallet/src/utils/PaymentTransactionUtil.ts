import type { Action } from '@walletconnect/pay';
import { BigNumber, providers, utils } from 'ethers';
import Config from 'react-native-config';

import LogStore, { serializeError } from '@/store/LogStore';
import { PresetsUtil } from '@/utils/PresetsUtil';

const POLYGON_MIN_PRIORITY_FEE_WEI = BigNumber.from('30000000000'); // 30 gwei
const WALLETCONNECT_RPC_BASE_URL = 'https://rpc.walletconnect.org/v1/';
const WALLETCONNECT_FUNGIBLE_PRICE_URL =
  'https://rpc.walletconnect.org/v1/fungible/price';
const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const TX_CONFIRMATION_TIMEOUT_MS = 120_000;
const GAS_ESTIMATION_RPC_TIMEOUT_MS = 15_000;
const PRICE_ESTIMATION_TIMEOUT_MS = 10_000;
const PRICE_CACHE_TTL_MS = 60_000;
const DEFAULT_FIAT_CURRENCY = 'USD';

const NATIVE_SYMBOL_BY_CHAIN_ID: Record<string, string> = {
  'eip155:1': 'ETH',
  'eip155:10': 'ETH',
  'eip155:11155420': 'ETH',
  'eip155:42161': 'ETH',
  'eip155:8453': 'ETH',
  'eip155:1313161554': 'ETH',
  'eip155:7777777': 'ETH',
  'eip155:137': 'POL',
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

const SUPPORTED_FIAT_CURRENCIES = new Set(['USD', 'EUR']);

type FungiblePriceResponse = {
  fungibles?: Array<{
    address?: string;
    price?: number;
    symbol?: string;
  }>;
};

type CachedPrice = {
  price: number;
  expiresAt: number;
};

const nativePriceCache = new Map<string, CachedPrice>();
const nativePriceRequestCache = new Map<
  string,
  Promise<{ price: number; currency: string } | null>
>();

export type TransactionFeeEstimate = {
  display: string;
  nativeDisplay: string;
  fiatValue: number | null;
  fiatCurrency: string | null;
  chainId: string;
  nativeSymbol: string;
};

export type TransactionWallet = {
  connect: (provider: providers.JsonRpcProvider) =>
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

  return `${WALLETCONNECT_RPC_BASE_URL}?chainId=${encodeURIComponent(
    chainId,
  )}&projectId=${encodeURIComponent(projectId)}`;
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

function normalizeFiatCurrency(currency?: string): string {
  const normalized = currency?.trim().toUpperCase();
  if (normalized && SUPPORTED_FIAT_CURRENCIES.has(normalized)) {
    return normalized;
  }
  return DEFAULT_FIAT_CURRENCY;
}

function getNativeFungibleAddress(chainId: string): string {
  return `${chainId}:${NATIVE_TOKEN_ADDRESS}`;
}

async function fetchNativeTokenPrice({
  chainId,
  currency,
}: {
  chainId: string;
  currency?: string;
}): Promise<{ price: number; currency: string } | null> {
  const projectId = Config.ENV_PROJECT_ID?.trim();
  if (!projectId) {
    return null;
  }

  const fiatCurrency = normalizeFiatCurrency(currency);
  const cacheKey = `${fiatCurrency}:${chainId}`;
  const cachedPrice = nativePriceCache.get(cacheKey);
  if (cachedPrice && cachedPrice.expiresAt > Date.now()) {
    return { price: cachedPrice.price, currency: fiatCurrency };
  }

  const pendingRequest = nativePriceRequestCache.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const nativeAddress = getNativeFungibleAddress(chainId);

  const request = (async () => {
    try {
      const response = await withTimeout(
        fetch(WALLETCONNECT_FUNGIBLE_PRICE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            currency: fiatCurrency.toLowerCase(),
            addresses: [nativeAddress],
          }),
        }),
        PRICE_ESTIMATION_TIMEOUT_MS,
        `fungible price timed out after ${PRICE_ESTIMATION_TIMEOUT_MS}ms`,
      );

      if (!response.ok) {
        LogStore.warn(
          'Native token price request failed',
          'PaymentTransactionUtil',
          'fetchNativeTokenPrice',
          { chainId, currency: fiatCurrency, status: response.status },
        );
        return null;
      }

      const data = (await response.json()) as FungiblePriceResponse;
      const fungible = data.fungibles?.find(
        item => item.address?.toLowerCase() === nativeAddress.toLowerCase(),
      );
      const price = fungible?.price;
      if (!Number.isFinite(price) || !price || price <= 0) {
        return null;
      }

      nativePriceCache.set(cacheKey, {
        price,
        expiresAt: Date.now() + PRICE_CACHE_TTL_MS,
      });

      return { price, currency: fiatCurrency };
    } catch (error) {
      LogStore.warn(
        'Failed to fetch native token price',
        'PaymentTransactionUtil',
        'fetchNativeTokenPrice',
        {
          chainId,
          currency: fiatCurrency,
          error: serializeError(error),
        },
      );
      return null;
    }
  })();

  nativePriceRequestCache.set(cacheKey, request);
  return request.finally(() => {
    nativePriceRequestCache.delete(cacheKey);
  });
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
      typeof tx.data === 'string'
        ? Math.max(0, (tx.data.length - 2) / 2)
        : null,
  };
}

function formatNativeGasEstimate({
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
    return `${feeValue.toFixed(4)} ${symbol}`;
  }

  return `${feeValue.toFixed(6)} ${symbol}`;
}

function formatFiatGasEstimate({
  fiatValue,
  currency,
}: {
  fiatValue: number;
  currency: string;
}): string {
  const symbol = currency === 'EUR' ? '€' : '$';

  if (!Number.isFinite(fiatValue) || fiatValue <= 0) {
    return `${symbol}0.00`;
  }

  if (fiatValue < 0.01) {
    return `<${symbol}0.01`;
  }

  return `${symbol}${fiatValue.toFixed(2)}`;
}

function buildGasEstimate({
  totalFeeWei,
  chainId,
  nativeTokenPrice,
}: {
  totalFeeWei: BigNumber;
  chainId: string;
  nativeTokenPrice: { price: number; currency: string } | null;
}): TransactionFeeEstimate {
  const nativeSymbol = NATIVE_SYMBOL_BY_CHAIN_ID[chainId] || 'ETH';
  const nativeDisplay = formatNativeGasEstimate({ totalFeeWei, chainId });
  const nativeValue = Number(utils.formatEther(totalFeeWei));
  const fiatCurrency = nativeTokenPrice?.currency ?? null;
  const fiatValue =
    nativeTokenPrice && Number.isFinite(nativeValue) && nativeValue > 0
      ? nativeValue * nativeTokenPrice.price
      : null;

  return {
    display:
      fiatValue !== null
        ? formatFiatGasEstimate({
            fiatValue,
            currency: fiatCurrency ?? DEFAULT_FIAT_CURRENCY,
          })
        : nativeDisplay,
    nativeDisplay,
    fiatValue,
    fiatCurrency,
    chainId,
    nativeSymbol,
  };
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

export async function estimateTransactionFee(
  action: Action,
  options: { currency?: string } = {},
): Promise<TransactionFeeEstimate | null> {
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
    withTimeout(
      provider.estimateGas(baseTx),
      GAS_ESTIMATION_RPC_TIMEOUT_MS,
      `estimateGas timed out after ${GAS_ESTIMATION_RPC_TIMEOUT_MS}ms`,
    ),
    withTimeout(
      provider.getFeeData(),
      GAS_ESTIMATION_RPC_TIMEOUT_MS,
      `getFeeData timed out after ${GAS_ESTIMATION_RPC_TIMEOUT_MS}ms`,
    ),
    withTimeout(
      provider.getBlock('latest'),
      GAS_ESTIMATION_RPC_TIMEOUT_MS,
      `getBlock(latest) timed out after ${GAS_ESTIMATION_RPC_TIMEOUT_MS}ms`,
    ),
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
  const nativeTokenPrice = await fetchNativeTokenPrice({
    chainId: walletRpc.chainId,
    currency: options.currency,
  });

  return buildGasEstimate({
    totalFeeWei,
    chainId: walletRpc.chainId,
    nativeTokenPrice,
  });
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

  LogStore.log('Submitting transaction', 'PaymentTransactionUtil', logContext, {
    chainId,
    tx: serializeTxRequestForLog(txRequest),
  });

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
