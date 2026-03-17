import { Contract, providers, utils } from 'ethers';
import { EIP155_CHAINS } from '@/constants/Eip155';
import { TokenBalance } from '@/utils/BalanceTypes';
import LogStore, { serializeError } from '@/store/LogStore';

const ERC20_BALANCE_OF_ABI = ['function balanceOf(address) view returns (uint256)'];

interface ERC20TokenConfig {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  chainIds: string[];
}

const EURC_ADDRESS = '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c';

const ERC20_TOKENS: ERC20TokenConfig[] = [
  {
    name: 'EURC',
    symbol: 'EURC',
    address: EURC_ADDRESS,
    decimals: 6,
    chainIds: ['eip155:1'],
  },
];

async function fetchSingleERC20Balance(
  walletAddress: string,
  token: ERC20TokenConfig,
  chainId: string,
): Promise<TokenBalance | null> {
  const chain = EIP155_CHAINS[chainId];
  if (!chain) {
    return null;
  }

  try {
    const provider = new providers.JsonRpcProvider(chain.rpcUrl);
    const contract = new Contract(token.address, ERC20_BALANCE_OF_ABI, provider);
    const rawBalance = await contract.balanceOf(walletAddress);
    const numeric = utils.formatUnits(rawBalance, token.decimals);

    return {
      name: token.name,
      symbol: token.symbol,
      chainId,
      address: token.address,
      value: 0,
      price: 0,
      quantity: {
        decimals: String(token.decimals),
        numeric,
      },
      iconUrl: undefined,
    };
  } catch (error) {
    LogStore.error(
      `Failed to fetch ${token.symbol} balance on ${chainId}`,
      'ERC20BalanceService',
      'fetchSingleERC20Balance',
      { error: serializeError(error) },
    );
    return null;
  }
}

export async function fetchERC20Balances(
  walletAddress: string,
): Promise<TokenBalance[]> {
  const calls = ERC20_TOKENS.flatMap(token =>
    token.chainIds.map(chainId => fetchSingleERC20Balance(walletAddress, token, chainId)),
  );

  const results = await Promise.allSettled(calls);
  const balances: TokenBalance[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      balances.push(result.value);
    }
  }

  LogStore.log(
    'ERC-20 on-chain balances fetched',
    'ERC20BalanceService',
    'fetchERC20Balances',
    { count: balances.length },
  );

  return balances;
}
