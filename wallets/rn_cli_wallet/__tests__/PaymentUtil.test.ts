import type { Action } from '@walletconnect/pay';

import { EIP155_SIGNING_METHODS } from '../src/constants/Eip155';
import {
  getApprovalAction,
  requiresApproval,
  shouldShowSetupLoader,
} from '../src/utils/PaymentUtil';

function createAction(method: string): Action {
  return {
    walletRpc: {
      chainId: 'eip155:137',
      method,
      params: '[]',
    },
  };
}

describe('Payment approval helpers', () => {
  it('marks approval as required when eth_sendTransaction is present', () => {
    const sendTxAction = createAction(
      EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    );

    expect(requiresApproval([sendTxAction])).toBe(true);
    expect(getApprovalAction([sendTxAction])).toBe(sendTxAction);
    expect(shouldShowSetupLoader([sendTxAction])).toBe(false);
  });

  it('does not require approval when there is no eth_sendTransaction action', () => {
    const typedDataAction = createAction(
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
    );

    expect(requiresApproval([typedDataAction])).toBe(false);
    expect(getApprovalAction([typedDataAction])).toBeNull();
    expect(shouldShowSetupLoader([typedDataAction])).toBe(false);
  });

  it('does not require approval when actions are missing', () => {
    expect(requiresApproval(null)).toBe(false);
    expect(getApprovalAction(null)).toBeNull();
    expect(shouldShowSetupLoader(null)).toBe(false);
  });

  it('does not require approval for signature-only option actions', () => {
    const typedDataAction = createAction(
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
    );

    expect(requiresApproval([typedDataAction])).toBe(false);
    expect(getApprovalAction([typedDataAction])).toBeNull();
    expect(shouldShowSetupLoader([typedDataAction])).toBe(false);
  });

  it('finds the approval action when option actions include approval and signature steps', () => {
    const sendTxAction = createAction(
      EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    );
    const typedDataAction = createAction(
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
    );

    expect(requiresApproval([sendTxAction, typedDataAction])).toBe(true);
    expect(getApprovalAction([sendTxAction, typedDataAction])).toBe(
      sendTxAction,
    );
    expect(shouldShowSetupLoader([sendTxAction, typedDataAction])).toBe(true);
  });
});
