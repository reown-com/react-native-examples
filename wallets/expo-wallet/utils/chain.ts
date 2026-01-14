import { EIP155_CHAINS } from '@/constants/eip155';
import { Chain } from '@/utils/types';
import { ImageSourcePropType } from 'react-native';

/**
 * Chain registries by namespace.
 * Add new namespaces here as they are supported (e.g., solana, sui, ton).
 */
const CHAIN_REGISTRIES: Record<string, Record<string, Chain>> = {
  eip155: EIP155_CHAINS,
  // Future: Add other namespace registries
  // solana: SOLANA_CHAINS,
  // sui: SUI_CHAINS,
};

/**
 * Get chain data from a CAIP-2 chain ID.
 * Supports multiple namespaces (eip155, solana, etc.).
 *
 * @param caip2ChainId - Chain ID in CAIP-2 format (e.g., "eip155:8453", "solana:mainnet")
 * @returns Chain data or undefined if not found
 *
 * @example
 * const chain = getChainFromCaip2('eip155:8453');
 * // { chainId: '8453', name: 'Base', namespace: 'eip155', ... }
 */
export function getChainFromCaip2(caip2ChainId?: string): Chain | undefined {
  if (!caip2ChainId) return undefined;

  const registry = CHAIN_REGISTRIES[getNamespace(caip2ChainId)];
  if (!registry) return undefined;

  return registry[caip2ChainId];
}

/**
 * Get chain data from a numeric chain ID and namespace.
 *
 * @param chainId - Numeric or string chain ID (e.g., "8453", 8453)
 * @param namespace - Chain namespace (e.g., "eip155"). Defaults to "eip155".
 * @returns Chain data or undefined if not found
 */
export function getChainFromId(
  chainId?: string | number,
  namespace: string = 'eip155',
): Chain | undefined {
  if (chainId === undefined || chainId === null) return undefined;

  const caip2 = `${namespace}:${chainId}`;
  return getChainFromCaip2(caip2);
}

/**
 * Get the chain icon for a given CAIP-2 chain ID.
 * Returns undefined if chain is not found.
 *
 * @param caip2ChainId - Chain ID in CAIP-2 format
 * @returns Image source for the chain icon, or undefined
 */
export function getChainIcon(
  caip2ChainId?: string,
): ImageSourcePropType | undefined {
  const chain = getChainFromCaip2(caip2ChainId);
  return chain?.icon;
}

/**
 * Get the chain icon from a numeric chain ID.
 *
 * @param chainId - Numeric or string chain ID
 * @param namespace - Chain namespace. Defaults to "eip155".
 * @returns Image source for the chain icon, or undefined
 */
export function getChainIconFromId(
  chainId?: string | number,
  namespace: string = 'eip155',
): ImageSourcePropType | undefined {
  const chain = getChainFromId(chainId, namespace);
  return chain?.icon;
}

/**
 * Extract namespace from a CAIP-2 chain ID.
 *
 * @param caip2ChainId - Chain ID in CAIP-2 format (e.g., "eip155:1")
 * @returns The namespace (e.g., "eip155")
 */
export function getNamespace(caip2ChainId: string): string {
  return caip2ChainId.split(':')[0];
}

/**
 * Extract the chain reference from a CAIP-2 chain ID.
 *
 * @param caip2ChainId - Chain ID in CAIP-2 format (e.g., "eip155:1")
 * @returns The chain reference (e.g., "1")
 */
export function getChainReference(caip2ChainId: string): string {
  return caip2ChainId.split(':')[1] ?? '';
}
