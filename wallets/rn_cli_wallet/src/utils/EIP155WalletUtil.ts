import AsyncStorage from '@react-native-async-storage/async-storage';
import EIP155Lib from '../lib/EIP155Lib';
import {ethers} from 'ethers';
import {PresetsUtil} from '../utils/PresetsUtil';
import {getAbiByPrefix, parseChainId} from './HelperUtil';
import {TransactionType} from './TypesUtil';

export let wallet1: EIP155Lib;
export let wallet2: EIP155Lib;
export let eip155Wallets: Record<string, EIP155Lib>;
export let eip155Addresses: string[];

let address1: string;
let address2: string;

/**
 * Utilities
 */
export async function createOrRestoreEIP155Wallet() {
  const mnemonic1 =
    (await AsyncStorage.getItem('EIP155_MNEMONIC_1')) || undefined;
  const privateKey1 =
    (await AsyncStorage.getItem('EIP155_PRIVATE_1')) || undefined;

  if (mnemonic1 || privateKey1) {
    wallet1 = EIP155Lib.init({mnemonic: mnemonic1, privateKey: privateKey1});
  } else {
    wallet1 = EIP155Lib.init({});
    // Don't store mnemonic in local storage in a production project!
    AsyncStorage.setItem('EIP155_MNEMONIC_1', wallet1.getMnemonic());
  }

  address1 = wallet1.getAddress();

  eip155Wallets = {
    [address1]: wallet1,
    [address2]: wallet1,
  };
  eip155Addresses = Object.keys(eip155Wallets);

  return {
    eip155Wallets,
    eip155Addresses,
  };
}

export async function replaceMnemonic(mnemonicOrPrivateKey: string) {
  try {
    let wallet;
    if (mnemonicOrPrivateKey.includes(' ')) {
      wallet = EIP155Lib.init({mnemonic: mnemonicOrPrivateKey});
      await AsyncStorage.setItem('EIP155_MNEMONIC_1', wallet.getMnemonic());
    } else {
      wallet = EIP155Lib.init({privateKey: mnemonicOrPrivateKey});
      await AsyncStorage.setItem('EIP155_PRIVATE_1', wallet.wallet.privateKey);
    }
  } catch (error) {
    throw new Error('Invalid mnemonic or private key');
  }
}

export async function calculateEip155Gas(
  transaction: TransactionType,
  chainId: string,
) {
  console.log('calculateEip155Gas:', chainId);
  const chainData = PresetsUtil.getChainData(parseChainId(chainId));
  let provider = new ethers.providers.JsonRpcProvider(chainData.rpcUrl);

  // Fetch the latest block to get the base fee
  const block = await provider.getBlock('latest');
  if (!block) {
    return;
  }
  const baseFee = block.baseFeePerGas;
  const fees = await fetchGasPrice(parseChainId(chainId));

  // You can adjust the priority fee based on current network conditions
  const maxPriorityFeePerGas = fees.normal.priority_price.toString();
  // console.log('fees:', fees);
  // Calculate the max fee per gas (base fee + priority fee)
  const maxFeePerGas = baseFee!.add(maxPriorityFeePerGas);

  let gasLimit;
  try {
    gasLimit = await provider.estimateGas({
      ...transaction,
      chainId: chainData.id,
    });
    console.log('Gas Limit estimated:', gasLimit.toString());
  } catch (error) {
    console.error('Error estimating gas:', error);
    gasLimit = ethers.BigNumber.from(0x05b6a8);
  }

  // Log the details of the gas fees
  console.log('Base Fee:', ethers.utils.formatUnits(baseFee!, 'gwei'), 'Gwei');
  console.log(
    'Max Priority Fee:',
    ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei'),
    'Gwei',
  );
  console.log(
    'Max Fee per Gas:',
    ethers.utils.formatUnits(maxFeePerGas, 'gwei'),
    'Gwei',
  );
  console.log('Estimated Gas Limit:', gasLimit.toString());

  return {
    maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, 'wei'),
    maxPriorityFeePerGas: ethers.utils.formatUnits(maxPriorityFeePerGas, 'wei'),
    gasLimit: ethers.utils.formatUnits(gasLimit, 'wei'),
  };
}

const fetchGasPrice = async (chainId: string) => {
  const result = await fetch(
    `https://tokentool.bitbond.com/api/gas-price-20240116?chain_id=${parseChainId(
      chainId,
    )}&timestamp=${Date.now()}`,
  );
  const data = await result.json();
  console.log('fetchGasPrice:', data);
  return data?.data;
};

export async function calculateGasLimit(tx: any, chainId: string) {
  const chainData = PresetsUtil.getChainData(parseChainId(chainId));
  const provider = new ethers.providers.JsonRpcProvider(chainData.rpcUrl);

  const result = await provider.estimateGas(tx);
  return result;
}

export async function getNonce(address: string, chainId: string) {
  const chainData = PresetsUtil.getChainData(parseChainId(chainId));
  const provider = new ethers.providers.JsonRpcProvider(chainData.rpcUrl);

  const nonce = await provider.getTransactionCount(address);
  console.log('getNonce:', nonce);
  return nonce.toString();
}

export async function getTransferDetails(
  data: string,
  contractAddress: string,
  chainId: string,
) {
  const prefix = data.slice(0, 10);
  // Define the function ABI
  const abi = getAbiByPrefix(prefix);
  console.log('ABI:', abi);
  // Create an Interface instance
  const iabi = new ethers.utils.Interface(abi);
  console.log('Interface data', data);
  // Decode the transaction data
  const decodedData = iabi.parseTransaction({
    data: data,
  });

  const chainData = PresetsUtil.getChainData(parseChainId(chainId));
  // Connect to the Ethereum network
  const provider = new ethers.providers.JsonRpcProvider(chainData.rpcUrl);

  const ERC20_ABI = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
  ];

  console.log('Token Address:', contractAddress);
  // Create a contract instance
  const tokenContract = new ethers.Contract(
    contractAddress,
    ERC20_ABI,
    provider,
  );

  // Fetch decimals and symbol
  try {
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    const amount =
      parseInt(decodedData.args[1].toString(), 10) / 10 ** decimals;

    console.log(`Token Symbol: ${symbol}`);
    console.log(`Token Decimals: ${decimals}`);
    console.log(`Total Amount: ${amount}`);

    return {symbol, decimals, amount};
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}
