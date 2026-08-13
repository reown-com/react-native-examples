// SEP-53 conformance test for Stellar message signing.
//
// These are the OFFICIAL test vectors from the finalized SEP-53 spec:
//   https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md
// SEP-53 signs sha256("Stellar Signed Message:\n" || message). Pinning the
// expected signatures to the published vectors is what guarantees our wallet
// and any compliant Stellar verifier agree on the SAME algorithm — an
// implementation using a different prefix (e.g. the old
// "StellarMessage" || 0x00 || message scheme) cannot produce these outputs.

// StellarLib transitively pulls in react-native-mmkv (native) via LogStore. Stub it.
jest.mock('react-native-mmkv', () => ({
  MMKV: class {
    getString() {
      return undefined;
    }
    set() {}
    delete() {}
    getAllKeys() {
      return [];
    }
  },
}));

import StellarLib from '../src/lib/StellarLib';

// Shared across all official vectors.
const SEED = 'SAKICEVQLYWGSOJS4WW7HZJWAHZVEEBS527LHK5V4MLJALYKICQCJXMW';
const ADDRESS = 'GBXFXNDLV4LSWA4VB7YIL5GBD7BVNR22SGBTDKMO2SBZZHDXSKZYCP7L';

describe('StellarLib SEP-53 message signing', () => {
  let wallet: StellarLib;

  beforeAll(() => {
    wallet = new StellarLib({ secret: SEED });
  });

  it('derives the account address the vectors were generated with', () => {
    expect(wallet.getAddress()).toBe(ADDRESS);
  });

  it('signs a simple ASCII message (vector 1)', () => {
    expect(wallet.signMessage('Hello, World!')).toBe(
      'fO5dbYhXUhBMhe6kId/cuVq/AfEnHRHEvsP8vXh03M1uLpi5e46yO2Q8rEBzu3feXQewcQE5GArp88u6ePK6BA==',
    );
  });

  it('signs a UTF-8 Japanese message (vector 2)', () => {
    expect(wallet.signMessage('こんにちは、世界！')).toBe(
      'CDU265Xs8y3OWbB/56H9jPgUss5G9A0qFuTqH2zs2YDgTm+++dIfmAEceFqB7bhfN3am59lCtDXrCtwH2k1GBA==',
    );
  });

  it('signs a raw binary (base64-encoded) message (vector 3)', () => {
    expect(
      wallet.signMessage('2zZDP1sa1BVBfLP7TeeMk3sUbaxAkUhBhDiNdrksaFo=', 'base64'),
    ).toBe(
      'VA1+7hefNwv2NKScH6n+Sljj15kLAge+M2wE7fzFOf+L0MMbssA1mwfJZRyyrhBORQRle10X1Dxpx+UOI4EbDQ==',
    );
  });
});
