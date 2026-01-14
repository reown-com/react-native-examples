/**
 * WalletConnect Pay SDK Types
 *
 * Re-exports types from @walletconnect/pay SDK.
 * Also includes UI-specific types for the payment flow.
 */

// Re-export all types from the SDK
// Import types needed for PayState interface
import type {
  PaymentInfo,
  PaymentOption,
  CollectDataAction,
  CollectDataFieldResult,
} from '@walletconnect/pay';

export type {
  // Client types
  PayClientOptions,
  AppMetadata,
  // API types
  PaymentStatus,
  CollectDataFieldType,
  AmountDisplay,
  PayAmount,
  MerchantInfo,
  BuyerInfo,
  WalletRpcAction,
  Action,
  CollectDataField,
  CollectDataAction,
  CollectDataFieldResult,
  PaymentInfo,
  PaymentOption,
  // Request/Response types
  GetPaymentOptionsParams,
  GetRequiredPaymentActionsParams,
  ConfirmPaymentParams,
  PaymentOptionsResponse,
  ConfirmPaymentResponse,
  // Provider types
  PayProviderType,
} from '@walletconnect/pay';

// Re-export error classes
export {
  PayError,
  PaymentOptionsError,
  PaymentActionsError,
  ConfirmPaymentError,
} from '@walletconnect/pay';

// ============================================================================
// UI Step Types (specific to this app's payment flow)
// ============================================================================

export type PayStep =
  | 'initial-loading'
  | 'intro'
  | 'collect-name'
  | 'collect-dob'
  | 'collect-pob'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error';

/**
 * Payment flow state managed by usePaymentFlow hook.
 */
export interface PayState {
  step: PayStep;
  paymentId?: string;
  paymentInfo?: PaymentInfo;
  options: PaymentOption[];
  selectedOptionId?: string;
  collectData?: CollectDataAction;
  collectedData: CollectDataFieldResult[];
  error?: string;
}

// ============================================================================
// Reducer Action Types (for usePaymentFlow hook)
// ============================================================================

export type PayAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: InitSuccessPayload }
  | { type: 'INIT_ERROR'; payload: string }
  | { type: 'SET_STEP'; payload: PayStep }
  | { type: 'SELECT_OPTION'; payload: string }
  | { type: 'COLLECT_NAME'; payload: { firstName: string; lastName: string } }
  | { type: 'COLLECT_DOB'; payload: string }
  | { type: 'COLLECT_POB'; payload: { city: string; country: string } }
  | { type: 'CONFIRM_START' }
  | { type: 'CONFIRM_SUCCESS' }
  | { type: 'CONFIRM_ERROR'; payload: string }
  | { type: 'RETRY' };

interface InitSuccessPayload {
  paymentId: string;
  paymentInfo: PaymentInfo;
  options: PaymentOption[];
  collectData?: CollectDataAction;
}
