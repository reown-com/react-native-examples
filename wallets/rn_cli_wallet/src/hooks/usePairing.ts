import {
  handlePaymentLink,
  handleUriOrPaymentLink,
  isPaymentLink,
  pair,
} from '@/utils/PairingUtil';

export { isPaymentLink };

/**
 * Thin wrapper over `@/utils/PairingUtil`. The implementations are module-level
 * functions (they only touch singletons), so the references are already stable
 * and need no `useCallback`.
 */
export function usePairing() {
  return {
    pair,
    handlePaymentLink,
    handleUriOrPaymentLink,
    isPaymentLink,
  };
}
