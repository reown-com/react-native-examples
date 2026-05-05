import type { Action } from '@walletconnect/pay';

import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';

export function getApprovalAction(
  actions: readonly Action[] | null,
): Action | null {
  return (
    actions?.find(
      action =>
        action.walletRpc?.method ===
        EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    ) || null
  );
}

export function requiresApproval(actions: readonly Action[] | null): boolean {
  return !!getApprovalAction(actions);
}

export function shouldShowSetupLoader(
  actions: readonly Action[] | null,
): boolean {
  return (actions?.length ?? 0) > 1 && requiresApproval(actions);
}
