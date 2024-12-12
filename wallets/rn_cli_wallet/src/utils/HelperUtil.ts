import {utils} from 'ethers';
import {ProposalTypes} from '@walletconnect/types';
import {PresetsUtil} from './PresetsUtil';

/**
 * Truncates string (in the middle) via given lenght value
 */
export function truncate(value: string, length: number) {
  if (value?.length <= length) {
    return value;
  }

  const separator = '...';
  const stringLength = length - separator.length;
  const frontLength = Math.ceil(stringLength / 2);
  const backLength = Math.floor(stringLength / 2);

  return (
    value.substring(0, frontLength) +
    separator +
    value.substring(value.length - backLength)
  );
}

/**
 * Converts hex to utf8 string if it is valid bytes
 */
export function convertHexToUtf8(value: string) {
  if (utils.isHexString(value)) {
    return utils.toUtf8String(value);
  }

  return value;
}

/**
 * Gets message from various signing request methods by filtering out
 * a value that is not an address (thus is a message).
 * If it is a hex string, it gets converted to utf8 string
 */
export function getSignParamsMessage(params: string[]) {
  const message = params.filter(p => !utils.isAddress(p))[0];

  return convertHexToUtf8(message);
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string convert it to object
 */
export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter(p => !utils.isAddress(p))[0];

  if (typeof data === 'string') {
    return JSON.parse(data);
  }

  return data;
}

/**
 * Get our address from params checking if params string contains one
 * of our wallet addresses
 */
export function getWalletAddressFromParams(addresses: string[], params: any) {
  const paramsString = JSON.stringify(params);
  let address = '';
  addresses.forEach(addr => {
    if (paramsString.toLowerCase().includes(addr.toLowerCase())) {
      address = addr;
    }
  });
  return address;
}

/**
 * Check if chain is part of EIP155 standard
 */
export function isEIP155Chain(chain: string) {
  return chain.includes('eip155');
}

/**
 * Check if chain is part of COSMOS standard
 */
export function isCosmosChain(chain: string) {
  return chain.includes('cosmos');
}

/**
 * Check if chain is part of SOLANA standard
 */
export function isSolanaChain(chain: string) {
  return chain.includes('solana');
}

/**
 * Get Wallet supported chains
 */
export function getSupportedChains(
  requiredNamespaces: ProposalTypes.RequiredNamespaces,
  optionalNamespaces: ProposalTypes.OptionalNamespaces,
) {
  if (!requiredNamespaces && !optionalNamespaces) {
    return [];
  }

  const required = [];
  for (const [key, values] of Object.entries(requiredNamespaces)) {
    const chains = key.includes(':') ? key : values.chains;
    if (chains) {
      required.push(chains);
    }
  }

  const optional = [];
  for (const [key, values] of Object.entries(optionalNamespaces)) {
    const chains = key.includes(':') ? key : values.chains;
    if (chains) {
      optional.push(chains);
    }
  }

  const chains = [...required.flat(), ...optional.flat()];

  return chains
    .map(chain => PresetsUtil.getChainData(chain.split(':')[1]))
    .filter(chain => chain !== undefined);
}

export function getAbiByPrefix(prefix: string) {
  console.log('matching prefix:', prefix);
  if (prefix === '0xa9059cbb') {
    return ['function transfer(address to, uint256 amount)'];
  }

  if (prefix === '0x23b872dd') {
    return ['function approve(address spender, uint256 amount)'];
  }

  if (prefix === '0x095ea7b3') {
    return ['function approve(address spender, uint256 amount)'];
  }
  throw new Error(`Unknown abi for prefix: ${prefix}`);
}

export const parseChainId = (chainId: string) => {
  return chainId.includes(':') ? chainId.split(':')[1] : chainId;
};

export const isVerified = (verifyContext: any) => {
  return verifyContext?.verified?.validation === 'VALID';
};
