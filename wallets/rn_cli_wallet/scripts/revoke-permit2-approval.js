#!/usr/bin/env node

const { ethers } = require('ethers');

const WALLETCONNECT_RPC_BASE_URL = 'https://rpc.walletconnect.org/v1/';
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const ERC20_ABI = ['function approve(address spender, uint256 amount)'];

const USDT_BY_CHAIN = {
  'eip155:1': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  'eip155:10': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  'eip155:137': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  'eip155:8453': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  'eip155:42161': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  'eip155:43114': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  'eip155:59144': '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
};

const MIN_PRIORITY_FEE_GWEI_BY_CHAIN = {
  'eip155:137': '25',
};

function printUsage() {
  const supportedChains = Object.keys(USDT_BY_CHAIN).join(', ');
  console.log(`Usage:
  yarn permit2:revoke --chainId <eip155:chainId|chainId> --walletAddress <0x...> --privateKey <0x...> --projectId <projectId> [--tokenAddress <0x...>] [--minPriorityFeeGwei <number>]

Example:
  yarn permit2:revoke --chainId eip155:137 --walletAddress 0xYourAddress --privateKey 0xYourPrivateKey --projectId yourProjectId

Defaults:
  If --tokenAddress is omitted, the script uses the USDT address for the selected chain.
  For Polygon (eip155:137), min priority fee defaults to 25 gwei.
  Supported USDT chains: ${supportedChains}
`);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      throw new Error(`Unexpected argument "${current}"`);
    }

    const eqIndex = current.indexOf('=');
    if (eqIndex > -1) {
      const key = current.slice(2, eqIndex);
      const value = current.slice(eqIndex + 1);
      args[key] = value;
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function normalizeChainId(chainIdInput) {
  if (!chainIdInput) {
    throw new Error('Missing --chainId');
  }

  const value = String(chainIdInput).trim();
  if (/^\d+$/.test(value)) {
    return `eip155:${value}`;
  }

  if (/^eip155:\d+$/.test(value)) {
    return value;
  }

  throw new Error(
    `Invalid chainId "${chainIdInput}". Use numeric (e.g. 137) or CAIP-2 (e.g. eip155:137).`,
  );
}

function normalizePrivateKey(privateKeyInput) {
  if (!privateKeyInput) {
    throw new Error('Missing --privateKey');
  }

  const value = String(privateKeyInput).trim();
  const prefixed = value.startsWith('0x') ? value : `0x${value}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(prefixed)) {
    throw new Error('Invalid private key format. Expected 32-byte hex.');
  }

  return prefixed;
}

function normalizeAddress(name, address) {
  if (!address) {
    throw new Error(`Missing --${name}`);
  }

  try {
    return ethers.utils.getAddress(String(address).trim());
  } catch {
    throw new Error(`Invalid ${name}: ${address}`);
  }
}

function parseMinPriorityFeeWei(chainId, minPriorityFeeGweiArg) {
  const raw =
    minPriorityFeeGweiArg != null && String(minPriorityFeeGweiArg).trim() !== ''
      ? String(minPriorityFeeGweiArg).trim()
      : MIN_PRIORITY_FEE_GWEI_BY_CHAIN[chainId];

  if (!raw) {
    return ethers.constants.Zero;
  }

  if (!/^\d+(\.\d+)?$/.test(raw)) {
    throw new Error(`Invalid --minPriorityFeeGwei value: ${minPriorityFeeGweiArg}`);
  }

  return ethers.utils.parseUnits(raw, 'gwei');
}

function extractMinTipFromError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/minimum needed (\d+)/i);
  if (!match) {
    return null;
  }

  try {
    return ethers.BigNumber.from(match[1]);
  } catch {
    return null;
  }
}

function getWalletConnectRpcUrl(chainId, projectId) {
  if (!projectId) {
    throw new Error('Missing --projectId');
  }

  return `${WALLETCONNECT_RPC_BASE_URL}?chainId=${encodeURIComponent(chainId)}&projectId=${encodeURIComponent(projectId)}`;
}

function maxBigNumber(a, b) {
  return a.gt(b) ? a : b;
}

async function buildFeeOverrides({
  provider,
  signerAddress,
  txRequest,
  chainId,
  minPriorityFeeWei,
}) {
  const gasLimit = await provider.estimateGas({
    ...txRequest,
    from: signerAddress,
  });
  const feeData = await provider.getFeeData();
  const latestBlock = await provider.getBlock('latest');
  const baseFeePerGas = latestBlock?.baseFeePerGas || ethers.constants.Zero;

  const hasEip1559FeeData =
    !!feeData.maxFeePerGas ||
    !!feeData.maxPriorityFeePerGas ||
    baseFeePerGas.gt(0);

  if (!hasEip1559FeeData) {
    const gasPrice = maxBigNumber(
      feeData.gasPrice || ethers.constants.Zero,
      minPriorityFeeWei,
    );
    return { gasLimit, gasPrice };
  }

  const maxPriorityFeePerGas = maxBigNumber(
    feeData.maxPriorityFeePerGas || ethers.constants.Zero,
    minPriorityFeeWei,
  );
  const minMaxFeePerGas = baseFeePerGas.gt(0)
    ? baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
    : maxPriorityFeePerGas.mul(2);
  const maxFeePerGas = maxBigNumber(
    feeData.maxFeePerGas || ethers.constants.Zero,
    minMaxFeePerGas,
  );

  console.log(
    `fee config for ${chainId}: maxPriorityFeePerGas=${ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei, maxFeePerGas=${ethers.utils.formatUnits(maxFeePerGas, 'gwei')} gwei`,
  );

  return {
    gasLimit,
    maxPriorityFeePerGas,
    maxFeePerGas,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help === 'true' || args.h === 'true') {
    printUsage();
    return;
  }

  const chainId = normalizeChainId(args.chainId);
  const walletAddress = normalizeAddress('walletAddress', args.walletAddress);
  const privateKey = normalizePrivateKey(args.privateKey);
  const tokenAddress = normalizeAddress(
    'tokenAddress',
    args.tokenAddress || USDT_BY_CHAIN[chainId],
  );
  const minPriorityFeeWei = parseMinPriorityFeeWei(
    chainId,
    args.minPriorityFeeGwei,
  );
  const projectId = String(args.projectId || '').trim();

  if (!USDT_BY_CHAIN[chainId] && !args.tokenAddress) {
    throw new Error(
      `No default USDT address configured for ${chainId}. Pass --tokenAddress explicitly.`,
    );
  }

  const rpcUrl = getWalletConnectRpcUrl(chainId, projectId);
  const chainIdNumber = Number(chainId.split(':')[1]);
  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl, {
    chainId: chainIdNumber,
    name: `eip155-${chainIdNumber}`,
  });

  const signer = new ethers.Wallet(privateKey, provider);
  const signerAddress = ethers.utils.getAddress(signer.address);
  if (signerAddress !== walletAddress) {
    throw new Error(
      `walletAddress (${walletAddress}) does not match private key (${signerAddress}).`,
    );
  }

  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  console.log('Revoking Permit2 token approval...');
  console.log(`chainId: ${chainId}`);
  console.log(`wallet: ${walletAddress}`);
  console.log(`token: ${tokenAddress}`);
  console.log(`spender: ${PERMIT2_ADDRESS}`);

  const txRequest = await token.populateTransaction.approve(PERMIT2_ADDRESS, 0);
  const feeOverrides = await buildFeeOverrides({
    provider,
    signerAddress,
    txRequest,
    chainId,
    minPriorityFeeWei,
  });

  let tx;
  try {
    tx = await signer.sendTransaction({
      ...txRequest,
      ...feeOverrides,
    });
  } catch (error) {
    const minTipFromRpc = extractMinTipFromError(error);
    if (!minTipFromRpc) {
      throw error;
    }

    console.log(
      `RPC rejected tip as too low. Retrying with min tip ${ethers.utils.formatUnits(minTipFromRpc, 'gwei')} gwei...`,
    );
    const retryOverrides = await buildFeeOverrides({
      provider,
      signerAddress,
      txRequest,
      chainId,
      minPriorityFeeWei: maxBigNumber(minPriorityFeeWei, minTipFromRpc),
    });
    tx = await signer.sendTransaction({
      ...txRequest,
      ...retryOverrides,
    });
  }

  console.log(`tx hash: ${tx.hash}`);

  const receipt = await tx.wait();
  if (receipt.status !== 1) {
    throw new Error('Transaction reverted.');
  }

  console.log(`Revoke successful in block ${receipt.blockNumber}.`);
}

main().catch(error => {
  console.error(
    `Failed to revoke Permit2 approval: ${error instanceof Error ? error.message : String(error)}`,
  );
  printUsage();
  process.exit(1);
});
