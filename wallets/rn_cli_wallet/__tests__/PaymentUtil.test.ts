import type { Action } from '@walletconnect/pay';

import { EIP155_SIGNING_METHODS } from '../src/constants/Eip155';
import { getPaymentContext } from '../src/utils/PaymentUtil';

function createAction(method: string): Action {
  return {
    walletRpc: {
      chainId: 'eip155:137',
      method,
      params: '[]',
    },
  };
}

describe('getPaymentContext', () => {
  it('marks approval as required when eth_sendTransaction is present', () => {
    const sendTxAction = createAction(EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION);

    const context = getPaymentContext({
      paymentActions: [sendTxAction],
    });

    expect(context.requiresApproval).toBe(true);
    expect(context.approvalAction).toBe(sendTxAction);
  });

  it('does not require approval when there is no eth_sendTransaction action', () => {
    const typedDataAction = createAction(
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
    );

    const context = getPaymentContext({
      paymentActions: [typedDataAction],
    });

    expect(context.requiresApproval).toBe(false);
    expect(context.approvalAction).toBeNull();
  });

  it('does not require approval when actions are missing', () => {
    const context = getPaymentContext({
      paymentActions: null,
    });

    expect(context.requiresApproval).toBe(false);
    expect(context.approvalAction).toBeNull();
  });
});
