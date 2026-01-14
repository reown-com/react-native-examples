import type { PaymentOptionsResponse } from '@walletconnect/pay';

/**
 * Mock payment response for testing the collectData flow.
 * Enable by setting EXPO_PUBLIC_MOCK_PAYMENT="true" in .env
 */
export const mockPaymentResponse: PaymentOptionsResponse = {
  paymentId: 'pay_mock_12345',
  info: {
    status: 'requires_action',
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes from now
    merchant: {
      name: 'Test Coffee Shop',
      iconUrl: 'https://avatars.githubusercontent.com/u/37784886',
    },
    amount: {
      unit: 'USD',
      value: '5.99',
      display: {
        assetSymbol: 'USD',
        assetName: 'US Dollar',
        decimals: 2,
      },
    },
  },
  options: [
    {
      id: 'option_usdc_base',
      etaS: 30,
      amount: {
        unit: 'USDC',
        value: '5990000',
        display: {
          assetSymbol: 'USDC',
          assetName: 'USD Coin',
          decimals: 6,
          iconUrl:
            'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
          networkName: 'Base',
        },
      },
      actions: [
        {
          walletRpc: {
            chainId: 'eip155:8453',
            method: 'eth_sendTransaction',
            params: JSON.stringify({
              to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
              data: '0x',
              value: '0x0',
            }),
          },
        },
      ],
    },
    {
      id: 'option_usdc_arbitrum',
      etaS: 30,
      amount: {
        unit: 'USDC',
        value: '5990000',
        display: {
          assetSymbol: 'USDC',
          assetName: 'USD Coin',
          decimals: 6,
          iconUrl:
            'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
          networkName: 'Arbitrum One',
        },
      },
      actions: [
        {
          walletRpc: {
            chainId: 'eip155:42161',
            method: 'eth_sendTransaction',
            params: JSON.stringify({
              to: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
              data: '0x',
              value: '0x0',
            }),
          },
        },
      ],
    },
  ],
  collectData: {
    fields: [
      {
        id: 'firstName',
        fieldType: 'text',
        name: 'First Name',
        required: true,
      },
      { id: 'lastName', fieldType: 'text', name: 'Last Name', required: true },
      {
        id: 'dateOfBirth',
        fieldType: 'date',
        name: 'Date of Birth',
        required: true,
      },
      {
        id: 'placeOfBirthCity',
        fieldType: 'text',
        name: 'City of Birth',
        required: true,
      },
      {
        id: 'placeOfBirthCountry',
        fieldType: 'text',
        name: 'Country of Birth',
        required: true,
      },
    ],
  },
};

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
        chains: ['eip155:1', 'eip155:42161', 'eip155:43114'],
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
          chains: ['eip155:1', 'eip155:42161', 'eip155:43114'],
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
