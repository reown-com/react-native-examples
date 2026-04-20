import type { Action } from '@walletconnect/pay';

import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';

export type PaymentContext = {
  approvalAction: Action | null;
  requiresApproval: boolean;
};

function getApprovalAction(actions: readonly Action[] | null): Action | null {
  return (
    actions?.find(
      action =>
        action.walletRpc?.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    ) || null
  );
}

export function getPaymentContext({
  paymentActions,
}: {
  paymentActions: readonly Action[] | null;
}): PaymentContext {
  const approvalAction = getApprovalAction(paymentActions);

  return {
    approvalAction,
    requiresApproval: !!approvalAction,
  };
}
