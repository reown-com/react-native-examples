jest.mock('../src/store/LogStore', () => ({
  __esModule: true,
  default: { info: jest.fn() },
}));

jest.mock('../src/utils/SessionProposalUtil', () => ({
  approveSessionProposal: jest.fn(async () => ({})),
}));

import { WALLET_GUIDE_ID } from '../src/utils/misc';
import { approveSessionProposal } from '../src/utils/SessionProposalUtil';
import {
  autoApproveExploreProposal,
  EXPLORE_APPS,
  getOrigin,
  isExplorePairing,
  isSameOrigin,
  registerExplorePairing,
} from '../src/utils/ExploreUtil';

describe('origin check', () => {
  it('normalizes scheme, host case and default ports', () => {
    expect(getOrigin('https://React-App.walletconnect.com/x?y#z')).toBe(
      'https://react-app.walletconnect.com',
    );
    expect(getOrigin('https://app.walletconnect.com:443/stake')).toBe(
      'https://app.walletconnect.com',
    );
    expect(getOrigin('http://10.0.2.2:3000/')).toBe('http://10.0.2.2:3000');
    expect(getOrigin('wc:abc@2?relay-protocol=irn')).toBeUndefined();
  });

  it('rejects other origins and look-alike hosts', () => {
    const origin = 'https://app.walletconnect.com';
    expect(isSameOrigin('https://app.walletconnect.com/stake', origin)).toBe(
      true,
    );
    expect(isSameOrigin('https://evil.com/', origin)).toBe(false);
    expect(
      isSameOrigin('https://app.walletconnect.com.evil.com/', origin),
    ).toBe(false);
    expect(
      isSameOrigin('https://app.walletconnect.com@evil.com/', origin),
    ).toBe(false);
    expect(isSameOrigin('http://app.walletconnect.com/', origin)).toBe(false);
  });
});

describe('Explore pairing topics', () => {
  it('only recognizes registered topics', () => {
    registerExplorePairing('wc:abc123@2?relay-protocol=irn&symKey=k');
    expect(isExplorePairing('abc123')).toBe(true);
    expect(isExplorePairing('def456')).toBe(false);
    expect(isExplorePairing(undefined)).toBe(false);
  });
});

describe('EXPLORE_APPS', () => {
  // AppBrowser only injects the bridge when the tile URL has an origin.
  it.each(EXPLORE_APPS.map(app => [app.name, app.url]))(
    '%s has an https origin',
    (_name, url) => {
      expect(getOrigin(url)).toMatch(/^https:\/\/[^/]+$/);
    },
  );
});

describe('autoApproveExploreProposal', () => {
  it('approves the given chains with wallet_guide_id', async () => {
    const proposal = { id: 1, params: {} } as Parameters<
      typeof autoApproveExploreProposal
    >[0];
    await autoApproveExploreProposal(proposal, ['eip155:1']);
    expect(approveSessionProposal).toHaveBeenCalledWith(
      proposal,
      ['eip155:1'],
      { wallet_guide_id: WALLET_GUIDE_ID },
    );
  });
});
