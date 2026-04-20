import type { Action, PaymentOption } from '@walletconnect/pay';
import { utils } from 'ethers';

import { EIP155_SIGNING_METHODS } from '../src/constants/Eip155';
import { getPermit2Context } from '../src/utils/Permit2Util';

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111';
const OTHER_SPENDER = '0x2222222222222222222222222222222222222222';
const TYPED_TOKEN_ADDRESS = '0x3333333333333333333333333333333333333333';
const ERC20_APPROVE_INTERFACE = new utils.Interface([
  'function approve(address spender, uint256 amount)',
]);

function createPaymentOption(unit: unknown): PaymentOption {
  return {
    id: 'option-id',
    account: 'eip155:137:0xabc',
    etaS: 0,
    actions: [],
    amount: {
      unit: unit as string,
      value: '1000000',
      display: {
        assetSymbol: 'USDC',
        assetName: 'USD Coin',
        decimals: 6,
        networkName: 'Polygon',
      },
    },
  } as unknown as PaymentOption;
}

function createApproveAction(spender: string): Action {
  return {
    walletRpc: {
      chainId: 'eip155:137',
      method: EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
      params: JSON.stringify([
        {
          to: TOKEN_ADDRESS,
          data: ERC20_APPROVE_INTERFACE.encodeFunctionData('approve', [
            spender,
            '1',
          ]),
        },
      ]),
    },
  };
}

describe('getPermit2Context', () => {
  it('detects Permit2 approval actions and marks approval as required', () => {
    const context = getPermit2Context({
      paymentActions: [createApproveAction(PERMIT2_ADDRESS)],
      selectedOption: createPaymentOption(`caip19/eip155:137/erc20:${TOKEN_ADDRESS}`),
    });

    expect(context.requiresApproval).toBe(true);
    expect(context.approvalAction).not.toBeNull();
    expect(context.revokeTarget).toEqual({
      chainId: 'eip155:137',
      tokenAddress: TOKEN_ADDRESS,
    });
  });

  it('ignores non-Permit2 approvals even when the method is eth_sendTransaction', () => {
    const context = getPermit2Context({
      paymentActions: [createApproveAction(OTHER_SPENDER)],
      selectedOption: createPaymentOption(`caip19/eip155:137/erc20:${TOKEN_ADDRESS}`),
    });

    expect(context.requiresApproval).toBe(false);
    expect(context.approvalAction).toBeNull();
    expect(context.revokeTarget).toEqual({
      chainId: 'eip155:137',
      tokenAddress: TOKEN_ADDRESS,
    });
  });

  it('derives revoke target from typed-data when option unit is not CAIP-19', () => {
    const typedData = {
      domain: { chainId: 137 },
      message: {
        permitted: { token: TYPED_TOKEN_ADDRESS },
      },
      types: {
        EIP712Domain: [],
      },
    };

    const typedDataAction: Action = {
      walletRpc: {
        chainId: 'eip155:137',
        method: EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
        params: JSON.stringify(['0xabc', JSON.stringify(typedData)]),
      },
    };

    const context = getPermit2Context({
      paymentActions: [typedDataAction],
      selectedOption: createPaymentOption('eip155:137/slip44:60'),
    });

    expect(context.requiresApproval).toBe(false);
    expect(context.revokeTarget).toEqual({
      chainId: 'eip155:137',
      tokenAddress: TYPED_TOKEN_ADDRESS,
    });
  });

  it('returns no revoke target for non-ERC20 options', () => {
    const context = getPermit2Context({
      paymentActions: null,
      selectedOption: createPaymentOption('eip155:137/slip44:60'),
    });

    expect(context.requiresApproval).toBe(false);
    expect(context.approvalAction).toBeNull();
    expect(context.revokeTarget).toBeNull();
  });
});
