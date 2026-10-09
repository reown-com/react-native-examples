jest.mock('../src/store/SettingsStore', () => ({
  __esModule: true,
  default: {
    state: {
      testNets: false,
      eip155Address: '',
      suiAddress: '',
      tonAddress: 'ton-address',
      tronAddress: '',
      cantonAddress: '',
      solanaAddress: '',
      bitcoinAddresses: [],
      stellarAddress: '',
    },
    setSessions: jest.fn(),
  },
}));

jest.mock('../src/utils/WalletKitUtil', () => ({
  walletKit: {
    approveSession: jest.fn(async () => ({})),
    getActiveSessions: () => ({}),
  },
}));

jest.mock('../src/utils/WalletInitializationUtil', () => ({
  ensureWalletsForChainIds: jest.fn(async () => {}),
}));

jest.mock('../src/utils/TonWalletUtil', () => ({
  getWallet: jest.fn(async () => ({
    getPublicKey: () => 'ton-pubkey',
    getStateInit: () => 'ton-state-init',
  })),
}));

import { walletKit } from '../src/utils/WalletKitUtil';
import { approveSessionProposal } from '../src/utils/SessionProposalUtil';

const tonProposal = {
  id: 1,
  params: {
    id: 1,
    requiredNamespaces: {},
    optionalNamespaces: {
      ton: { chains: ['ton:-239'], methods: ['ton_sendMessage'], events: [] },
    },
  },
} as unknown as Parameters<typeof approveSessionProposal>[0];

describe('approveSessionProposal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('merges extra session properties with the TON properties', async () => {
    await approveSessionProposal(tonProposal, ['ton:-239'], {
      wallet_guide_id: 'guide-id',
    });
    expect(walletKit.approveSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionProperties: {
          wallet_guide_id: 'guide-id',
          ton_getPublicKey: 'ton-pubkey',
          ton_getStateInit: 'ton-state-init',
        },
      }),
    );
  });

  it('sends no wallet_guide_id without extra properties', async () => {
    await approveSessionProposal(tonProposal, ['ton:-239']);
    const { sessionProperties } = (walletKit.approveSession as jest.Mock).mock
      .calls[0][0];
    expect(sessionProperties).not.toHaveProperty('wallet_guide_id');
  });
});
