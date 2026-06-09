import { isSpamToken } from '../src/utils/SpamFilter';

describe('isSpamToken', () => {
  it('flags symbols embedding URLs or protocols', () => {
    expect(isSpamToken('ecAVAX - https://invest')).toBe(true);
    expect(isSpamToken('claim at http://scam.io')).toBe(true);
    expect(isSpamToken('www.2base.cfd')).toBe(true);
    expect(isSpamToken('token://airdrop')).toBe(true);
  });

  it('flags domain-like patterns', () => {
    expect(isSpamToken('2base.cfd')).toBe(true);
    expect(isSpamToken('gftpepe.com')).toBe(true);
  });

  it('flags bracketed advertising', () => {
    expect(isSpamToken('USD0 [www.usual.finance]')).toBe(true);
    expect(isSpamToken('REWARD ]')).toBe(true);
  });

  it('flags blocklisted symbols regardless of case/whitespace', () => {
    expect(isSpamToken('BASED')).toBe(true);
    expect(isSpamToken(' gt ')).toBe(true);
    expect(isSpamToken('mantra pos')).toBe(true);
  });

  it('keeps legitimate token symbols', () => {
    ['ETH', 'USDC', 'SOL', 'EURC', 'WBTC', 'TRX', 'SUI', 'TON'].forEach(
      symbol => {
        expect(isSpamToken(symbol)).toBe(false);
      },
    );
  });

  it('handles empty input', () => {
    expect(isSpamToken('')).toBe(false);
  });
});
