import {
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
