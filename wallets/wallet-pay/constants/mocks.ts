export const mockedProposal = {
  id: 123,
  params: {
    id: 123,
    pairingTopic: '123',
    expiryTimestamp: 1761942015,
    attestation: 'ey',
    encryptedId: 'e0',
    requiredNamespaces: {},
    optionalNamespaces: {
      eip155: {
        chains: ['eip155:1'],
        methods: ['eth_sendTransaction', 'personal_sign'],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
    relays: [
      {
        protocol: 'irn',
      },
    ],
    proposer: {
      publicKey: '123',
      metadata: {
        description: 'App to test WalletConnect network',
        url: 'https://react-app.walletconnect.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
        name: 'React App',
      },
    },
    requests: {
      authentication: [
        {
          domain: 'react-app.walletconnect.com',
          chains: ['eip155:1'],
          nonce: '1',
          type: 'caip122',
          aud: 'https://react-app.walletconnect.com',
          version: '1',
          iat: '2025-10-31T20:03:35.704Z',
        },
      ],
    },
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.org',
      validation: 'VALID',
      origin: 'https://react-app.walletconnect.com',
      isScam: false,
    },
  },
};
