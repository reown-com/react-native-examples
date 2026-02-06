import type { PaymentOption } from '@walletconnect/pay';

import type { ErrorType } from './utils';

// ----- Step Types -----

export type Step =
  | 'loading'
  | 'intro'
  | 'collectData'
  | 'collectDataWebView'
  | 'confirm'
  | 'confirming'
  | 'result';

// ----- State Type -----

export interface PaymentModalState {
  // Navigation
  step: Step;

  // Result state
  resultStatus: 'success' | 'error';
  resultMessage: string;
  resultErrorType: ErrorType | null;

  // Payment state
  selectedOption: PaymentOption | null;
  paymentActions: any[] | null;
  isLoadingActions: boolean;
  actionsError: string | null;

  // Form state
  collectedData: Record<string, string>;
  collectDataError: string | null;
  fieldErrors: Record<string, string>;
}

// ----- Initial State -----

export const initialState: PaymentModalState = {
  step: 'loading',
  resultStatus: 'success',
  resultMessage: '',
  resultErrorType: null,
  selectedOption: null,
  paymentActions: null,
  isLoadingActions: false,
  actionsError: null,
  collectedData: {},
  collectDataError: null,
  fieldErrors: {},
};

// ----- Action Types -----

export type PaymentModalAction =
  // Navigation actions
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'RESET' }

  // Result actions
  | {
      type: 'SET_RESULT';
      payload: {
        status: 'success' | 'error';
        message: string;
        errorType?: ErrorType;
      };
    }

  // Payment actions
  | { type: 'SELECT_OPTION'; payload: PaymentOption }
  | { type: 'CLEAR_SELECTED_OPTION' }
  | { type: 'SET_PAYMENT_ACTIONS'; payload: any[] }
  | { type: 'SET_LOADING_ACTIONS'; payload: boolean }
  | { type: 'SET_ACTIONS_ERROR'; payload: string | null }

  // Form actions
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; value: string } }
  | { type: 'SET_COLLECT_DATA_ERROR'; payload: string | null }
  | { type: 'SET_FIELD_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_FORM' };

// ----- Reducer -----

export function paymentModalReducer(
  state: PaymentModalState,
  action: PaymentModalAction,
): PaymentModalState {
  switch (action.type) {
    // Navigation actions
    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'RESET':
      return initialState;

    // Result actions
    case 'SET_RESULT':
      return {
        ...state,
        resultStatus: action.payload.status,
        resultMessage: action.payload.message,
        resultErrorType: action.payload.errorType ?? null,
      };

    // Payment actions
    case 'SELECT_OPTION':
      return { ...state, selectedOption: action.payload };

    case 'CLEAR_SELECTED_OPTION':
      return {
        ...state,
        selectedOption: null,
        paymentActions: null,
        actionsError: null,
      };

    case 'SET_PAYMENT_ACTIONS':
      return { ...state, paymentActions: action.payload };

    case 'SET_LOADING_ACTIONS':
      return { ...state, isLoadingActions: action.payload };

    case 'SET_ACTIONS_ERROR':
      return { ...state, actionsError: action.payload };

    // Form actions
    case 'UPDATE_FIELD': {
      // Clear the error for this specific field when it's updated
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload.fieldId]: _, ...remainingErrors } =
        state.fieldErrors;
      return {
        ...state,
        collectedData: {
          ...state.collectedData,
          [action.payload.fieldId]: action.payload.value,
        },
        collectDataError: null,
        fieldErrors: remainingErrors,
      };
    }

    case 'SET_COLLECT_DATA_ERROR':
      return { ...state, collectDataError: action.payload };

    case 'SET_FIELD_ERRORS':
      return { ...state, fieldErrors: action.payload };

    case 'CLEAR_FORM':
      return {
        ...state,
        collectedData: {},
        collectDataError: null,
        fieldErrors: {},
      };

    default:
      return state;
  }
}
