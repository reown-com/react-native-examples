import { JsonRpcProvider, Network, formatEther } from 'ethers';

import { PresetsUtil } from '@/utils/PresetsUtil';
import {
  NATIVE_SYMBOL_BY_CHAIN_ID,
  withTimeout,
} from '@/utils/PaymentTransactionUtil';

const FEE_ESTIMATION_TIMEOUT_MS = 15_000;

// Rollups charge an L1 data fee on top of gas × price, so the fee we compute
// there is only an estimate.
const ROLLUP_CHAIN_IDS = new Set([
  'eip155:10', // Optimism
  'eip155:11155420', // Optimism Sepolia
  'eip155:8453', // Base
  'eip155:42161', // Arbitrum
  'eip155:324', // zkSync Era
  'eip155:7777777', // Zora
  'eip155:1088', // Metis
  'eip155:4663', // Robinhood Chain
  'eip155:42220', // Celo (OP Stack L2)
]);

/** params[0] of eth_sendTransaction / eth_signTransaction (hex quantities). */
export interface EthTransactionParams {
  from?: string;
  to?: string;
  value?: string;
  data?: string;
  gas?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
}

function toBigInt(value: unknown): bigint | null {
  if (value == null || value === '') return null;
  try {
    return BigInt(value as string | number | bigint);
  } catch {
    return null;
  }
}

export function isRollupChain(chainId: string): boolean {
  return ROLLUP_CHAIN_IDS.has(chainId);
}

export function getNativeSymbol(chainId: string): string {
  return NATIVE_SYMBOL_BY_CHAIN_ID[chainId] ?? 'ETH';
}

/** Hex wei → ether string. A missing value means 0; invalid input → null. */
export function formatNativeAmount(value?: string): string | null {
  const wei = value == null ? 0n : toBigInt(value);
  return wei == null ? null : formatEther(wei);
}

export function isContractInteraction(data?: string): boolean {
  return !!data && data !== '0x';
}

/** gas × price from the request itself, or null if either is missing. */
export function getFeeFromParams(tx: EthTransactionParams): bigint | null {
  const gas = toBigInt(tx.gas ?? tx.gasLimit);
  const price = toBigInt(tx.maxFeePerGas ?? tx.gasPrice);
  return gas != null && price != null ? gas * price : null;
}

/**
 * Formats a wei fee with 4 significant digits, so tiny L2 fees don't round to
 * 0 (e.g. 21090909000 wei → "0.00000002109").
 */
export function formatFee(wei: bigint): string {
  const [whole, fraction = ''] = formatEther(wei).split('.');
  if (whole !== '0') {
    return `${whole}.${fraction.slice(0, 4)}`.replace(/\.?0+$/, '');
  }
  const firstNonZero = fraction.search(/[1-9]/);
  if (firstNonZero === -1) return '0';
  return `0.${fraction.slice(0, firstNonZero + 4)}`.replace(/0+$/, '');
}

/**
 * Fills in whatever the request is missing (gas limit and/or price) from the
 * chain's RPC and returns the total fee in wei. Throws if it can't.
 */
export async function estimateFee(
  tx: EthTransactionParams,
  chainId: string,
): Promise<bigint> {
  const chainData = PresetsUtil.getChainDataById(chainId);
  if (!chainData?.rpcUrl) {
    throw new Error(`Missing RPC URL for ${chainId}`);
  }
  // staticNetwork skips network detection, which otherwise retries forever
  // when the RPC is unreachable.
  const network = new Network(chainData.name, Number(chainData.chainId));
  const provider = new JsonRpcProvider(chainData.rpcUrl, network, {
    staticNetwork: network,
  });

  try {
    const [gas, price] = await Promise.all([
      toBigInt(tx.gas ?? tx.gasLimit) ??
        withTimeout(
          provider.estimateGas({
            from: tx.from,
            to: tx.to,
            value: tx.value,
            data: tx.data,
          }),
          FEE_ESTIMATION_TIMEOUT_MS,
          'estimateGas timed out',
        ),
      toBigInt(tx.maxFeePerGas ?? tx.gasPrice) ??
        // gasPrice tracks what's actually charged; ethers' maxFeePerGas is a
        // 2× base fee cap and would overstate the fee.
        withTimeout(
          provider.getFeeData(),
          FEE_ESTIMATION_TIMEOUT_MS,
          'getFeeData timed out',
        ).then(feeData => feeData.gasPrice ?? feeData.maxFeePerGas),
    ]);
    if (price == null) {
      throw new Error('Fee data unavailable');
    }
    return gas * price;
  } finally {
    provider.destroy();
  }
}
