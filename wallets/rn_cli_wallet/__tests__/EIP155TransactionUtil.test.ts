const mockEstimateGas = jest.fn();
const mockGetFeeData = jest.fn();
const mockDestroy = jest.fn();

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    estimateGas: mockEstimateGas,
    getFeeData: mockGetFeeData,
    destroy: mockDestroy,
  })),
}));

import {
  estimateFee,
  formatFee,
  formatNativeAmount,
  getFeeFromParams,
  getNativeSymbol,
  isContractInteraction,
  isRollupChain,
} from '../src/utils/EIP155TransactionUtil';

describe('formatNativeAmount', () => {
  it('formats hex wei as ether', () => {
    expect(formatNativeAmount('0x48c27395000')).toBe('0.000005');
  });

  it('treats a missing value as 0', () => {
    expect(formatNativeAmount(undefined)).toBe('0.0');
  });

  it('returns null for an invalid value', () => {
    expect(formatNativeAmount('not-a-number')).toBeNull();
  });
});

describe('getFeeFromParams', () => {
  it('multiplies gasLimit by gasPrice', () => {
    expect(getFeeFromParams({ gasLimit: '0x5208', gasPrice: '0x0f5329' })).toBe(
      21000n * 1004329n,
    );
  });

  it('prefers gas and maxFeePerGas', () => {
    expect(
      getFeeFromParams({
        gas: '0x5208',
        gasLimit: '0x1',
        maxFeePerGas: '0x2',
        gasPrice: '0x1',
      }),
    ).toBe(21000n * 2n);
  });

  it('returns null when gas or price is missing', () => {
    expect(getFeeFromParams({ gasPrice: '0x1' })).toBeNull();
    expect(getFeeFromParams({ gas: '0x5208' })).toBeNull();
    expect(getFeeFromParams({})).toBeNull();
  });
});

describe('formatFee', () => {
  it('keeps 4 significant digits for tiny fees', () => {
    expect(formatFee(21000n * 1004329n)).toBe('0.00000002109');
  });

  it('keeps 4 decimals for fees of 1 or more', () => {
    expect(formatFee(1234567890000000000n)).toBe('1.2345');
    expect(formatFee(2000000000000000000n)).toBe('2');
  });

  it('formats 0', () => {
    expect(formatFee(0n)).toBe('0');
  });
});

describe('chain helpers', () => {
  it('flags rollups', () => {
    expect(isRollupChain('eip155:10')).toBe(true);
    expect(isRollupChain('eip155:8453')).toBe(true);
    expect(isRollupChain('eip155:1')).toBe(false);
  });

  it('resolves the native symbol with an ETH fallback', () => {
    expect(getNativeSymbol('eip155:137')).toBe('POL');
    expect(getNativeSymbol('eip155:999999')).toBe('ETH');
  });

  it('detects contract interactions from data', () => {
    expect(isContractInteraction('0x')).toBe(false);
    expect(isContractInteraction(undefined)).toBe(false);
    expect(isContractInteraction('0xa9059cbb')).toBe(true);
  });
});

describe('estimateFee', () => {
  const tx = { from: '0x1', to: '0x2', value: '0x0', data: '0x' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('estimates only the gas limit when the price is provided', async () => {
    mockEstimateGas.mockResolvedValue(21000n);

    await expect(
      estimateFee({ ...tx, gasPrice: '0x2' }, 'eip155:1'),
    ).resolves.toBe(42000n);
    expect(mockGetFeeData).not.toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('fetches only the price, preferring gasPrice, when gas is provided', async () => {
    mockGetFeeData.mockResolvedValue({ gasPrice: 3n, maxFeePerGas: 10n });

    await expect(
      estimateFee({ ...tx, gas: '0x5208' }, 'eip155:1'),
    ).resolves.toBe(63000n);
    expect(mockEstimateGas).not.toHaveBeenCalled();
  });

  it('throws when the RPC returns no price', async () => {
    mockEstimateGas.mockResolvedValue(21000n);
    mockGetFeeData.mockResolvedValue({ gasPrice: null, maxFeePerGas: null });

    await expect(estimateFee(tx, 'eip155:1')).rejects.toThrow(
      'Fee data unavailable',
    );
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('throws for a chain without an RPC URL', async () => {
    await expect(estimateFee(tx, 'eip155:999999')).rejects.toThrow(
      'Missing RPC URL',
    );
  });
});
