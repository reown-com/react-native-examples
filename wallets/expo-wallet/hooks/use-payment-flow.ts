/**
 * Payment Flow Hook
 *
 * Manages the complete payment flow state and logic for the WalletConnect Pay SDK.
 * This hook encapsulates:
 * - State management via useReducer
 * - Payment initialization and option fetching
 * - Data collection (name, DOB)
 * - Payment confirmation and signing
 *
 * Usage:
 * ```tsx
 * const { state, actions, computed } = usePaymentFlow(paymentLink);
 * ```
 *
 * Note: This hook includes app-specific data collection steps (name, DOB).
 * Adapt the COLLECT_NAME and COLLECT_DOB actions to your app's requirements,
 * or remove them if your payment flow doesn't require data collection.
 */

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useWalletStore } from '@/stores/use-wallet-store';
import PayStore from '@/stores/use-pay-store';
import { EIP155_CHAINS } from '@/constants/eip155';
import { mockPaymentResponse } from '@/constants/mocks';
import { signPaymentActions } from '@/lib/pay/sign-payment';
import type {
  PayState,
  PayAction,
  PaymentOption,
  CollectDataFieldResult,
} from '@/lib/pay';

// Enable mock mode via environment variable
const USE_MOCK_PAYMENT =
  process.env.EXPO_PUBLIC_MOCK_PAYMENT === 'true' && __DEV__;

// ============================================================================
// Initial State
// ============================================================================

const initialState: PayState = {
  step: 'initial-loading',
  paymentId: undefined,
  paymentInfo: undefined,
  options: [],
  selectedOptionId: undefined,
  collectData: undefined,
  collectedData: [],
  error: undefined,
};

// ============================================================================
// Reducer
// ============================================================================

function paymentReducer(state: PayState, action: PayAction): PayState {
  switch (action.type) {
    case 'INIT_START':
      return { ...initialState, step: 'initial-loading' };

    case 'INIT_SUCCESS': {
      const { paymentId, paymentInfo, options, collectData } = action.payload;
      const requiresCollection = collectData && collectData.fields.length > 0;
      return {
        ...state,
        step: requiresCollection ? 'intro' : 'confirm',
        paymentId,
        paymentInfo,
        options,
        selectedOptionId: options[0]?.id,
        collectData,
      };
    }

    case 'INIT_ERROR':
      return { ...state, step: 'error', error: action.payload };

    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'SELECT_OPTION':
      return { ...state, selectedOptionId: action.payload };

    case 'COLLECT_NAME': {
      const { firstName, lastName } = action.payload;
      const filtered = state.collectedData.filter(
        (d) => d.id !== 'firstName' && d.id !== 'lastName',
      );
      return {
        ...state,
        step: 'collect-dob',
        collectedData: [
          ...filtered,
          { id: 'firstName', value: firstName },
          { id: 'lastName', value: lastName },
        ],
      };
    }

    case 'COLLECT_DOB': {
      const filtered = state.collectedData.filter(
        (d) => d.id !== 'dateOfBirth',
      );
      return {
        ...state,
        step: 'collect-pob',
        collectedData: [
          ...filtered,
          { id: 'dateOfBirth', value: action.payload },
        ],
      };
    }

    case 'COLLECT_POB': {
      const { city, country } = action.payload;
      const filtered = state.collectedData.filter(
        (d) => d.id !== 'placeOfBirthCity' && d.id !== 'placeOfBirthCountry',
      );
      return {
        ...state,
        step: 'confirm',
        collectedData: [
          ...filtered,
          { id: 'placeOfBirthCity', value: city },
          { id: 'placeOfBirthCountry', value: country },
        ],
      };
    }

    case 'CONFIRM_START':
      return { ...state, step: 'processing' };

    case 'CONFIRM_SUCCESS':
      return { ...state, step: 'success' };

    case 'CONFIRM_ERROR':
      return { ...state, step: 'error', error: action.payload };

    case 'RETRY':
      return { ...state, step: 'confirm', error: undefined };

    default:
      return state;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate CAIP-10 accounts for all supported EIP155 chains.
 * Format: "eip155:<chainId>:<address>"
 */
function getEip155Accounts(address: string): string[] {
  return Object.keys(EIP155_CHAINS).map((chainKey) => `${chainKey}:${address}`);
}

// ============================================================================
// Hook
// ============================================================================

export interface UsePaymentFlowResult {
  /** Current payment state */
  state: PayState;

  /** Actions to control the payment flow */
  actions: {
    /** Navigate back to previous step */
    goBack: () => void;
    /** Start the data collection flow */
    startCollection: () => void;
    /** Submit collected name data */
    submitName: (firstName: string, lastName: string) => void;
    /** Submit collected date of birth */
    submitDob: (dateOfBirth: Date) => void;
    /** Submit collected place of birth */
    submitPob: (city: string, country: string) => void;
    /** Select a payment option */
    selectOption: (option: PaymentOption) => void;
    /** Confirm and process the payment */
    confirm: () => Promise<void>;
    /** Retry after an error */
    retry: () => void;
  };

  /** Computed values derived from state */
  computed: {
    /** Currently selected payment option */
    selectedOption: PaymentOption | undefined;
    /** Whether data collection is required */
    requiresDataCollection: boolean;
    /** Progress indicator values */
    progress: { current: number; total: number };
    /** Whether back navigation is available */
    canGoBack: boolean;
    /** Whether header should be shown */
    showHeader: boolean;
    /** Whether progress steps should be shown */
    showProgressSteps: boolean;
  };
}

export function usePaymentFlow(
  paymentLink: string | undefined,
): UsePaymentFlowResult {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { evmWallet } = useWalletStore();

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    async function initializePayment() {
      if (!paymentLink || !evmWallet) {
        dispatch({
          type: 'INIT_ERROR',
          payload: 'Missing payment link or wallet',
        });
        return;
      }

      // Use mock data for testing collectData flow
      if (USE_MOCK_PAYMENT) {
        console.log('[Pay] Using MOCK payment data for testing');
        dispatch({
          type: 'INIT_SUCCESS',
          payload: {
            paymentId: mockPaymentResponse.paymentId,
            paymentInfo: mockPaymentResponse.info!,
            options: mockPaymentResponse.options,
            collectData: mockPaymentResponse.collectData ?? undefined,
          },
        });
        return;
      }

      const payClient = PayStore.getClient();
      if (!payClient) {
        dispatch({
          type: 'INIT_ERROR',
          payload:
            'Pay SDK not initialized. Please check your API key configuration.',
        });
        return;
      }

      try {
        const address = evmWallet.getAddress();
        const accounts = getEip155Accounts(address);

        if (__DEV__) {
          console.log('[Pay] Fetching payment options for:', paymentLink);
          console.log('[Pay] Accounts:', accounts.length, 'chains');
        }

        const response = await payClient.getPaymentOptions({
          paymentLink,
          accounts,
          includePaymentInfo: true,
        });

        if (__DEV__) {
          console.log('[Pay] Payment options response:', response);
        }

        if (!response.options || response.options.length === 0) {
          dispatch({
            type: 'INIT_ERROR',
            payload:
              'No payment options available for your wallet. Make sure you have supported tokens on a supported chain.',
          });
          return;
        }

        if (!response.info) {
          dispatch({
            type: 'INIT_ERROR',
            payload: 'Payment info not available',
          });
          return;
        }

        dispatch({
          type: 'INIT_SUCCESS',
          payload: {
            paymentId: response.paymentId,
            paymentInfo: response.info,
            options: response.options,
            collectData: response.collectData ?? undefined,
          },
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load payment';
        dispatch({ type: 'INIT_ERROR', payload: errorMessage });

        if (__DEV__) {
          console.error('[Pay] Payment initialization error:', err);
        }
      }
    }

    initializePayment();
  }, [paymentLink, evmWallet]);

  // ============================================================================
  // Actions
  // ============================================================================

  const goBack = useCallback(() => {
    const requiresCollection =
      state.collectData && state.collectData.fields.length > 0;

    switch (state.step) {
      case 'collect-name':
        dispatch({ type: 'SET_STEP', payload: 'intro' });
        break;
      case 'collect-dob':
        dispatch({ type: 'SET_STEP', payload: 'collect-name' });
        break;
      case 'collect-pob':
        dispatch({ type: 'SET_STEP', payload: 'collect-dob' });
        break;
      case 'confirm':
        if (requiresCollection) {
          dispatch({ type: 'SET_STEP', payload: 'collect-pob' });
        }
        break;
    }
  }, [state.step, state.collectData]);

  const startCollection = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: 'collect-name' });
  }, []);

  const submitName = useCallback((firstName: string, lastName: string) => {
    dispatch({ type: 'COLLECT_NAME', payload: { firstName, lastName } });
  }, []);

  const submitDob = useCallback((dateOfBirth: Date) => {
    const dobString = dateOfBirth.toISOString().split('T')[0]; // YYYY-MM-DD
    dispatch({ type: 'COLLECT_DOB', payload: dobString });
  }, []);

  const submitPob = useCallback((city: string, country: string) => {
    dispatch({ type: 'COLLECT_POB', payload: { city, country } });
  }, []);

  const selectOption = useCallback((option: PaymentOption) => {
    dispatch({ type: 'SELECT_OPTION', payload: option.id });
  }, []);

  const confirm = useCallback(async () => {
    if (!state.paymentId || !state.selectedOptionId || !evmWallet) {
      dispatch({ type: 'CONFIRM_ERROR', payload: 'Missing required data' });
      return;
    }

    dispatch({ type: 'CONFIRM_START' });

    // Mock mode: simulate successful payment
    if (USE_MOCK_PAYMENT) {
      console.log('[Pay] MOCK: Simulating payment confirmation...');
      console.log('[Pay] MOCK: Collected data:', state.collectedData);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch({ type: 'CONFIRM_SUCCESS' });
      return;
    }

    const payClient = PayStore.getClient();
    if (!payClient) {
      dispatch({ type: 'CONFIRM_ERROR', payload: 'Pay SDK not available' });
      return;
    }

    try {
      // Get required signing actions
      const actions = await payClient.getRequiredPaymentActions({
        paymentId: state.paymentId,
        optionId: state.selectedOptionId,
      });

      if (__DEV__) {
        console.log('[Pay] Required actions:', actions);
      }

      // Sign all actions
      const signatures = await signPaymentActions(actions, evmWallet);

      // Confirm the payment
      const collectedData: CollectDataFieldResult[] | undefined =
        state.collectedData.length > 0 ? state.collectedData : undefined;

      const result = await payClient.confirmPayment({
        paymentId: state.paymentId,
        optionId: state.selectedOptionId,
        signatures,
        collectedData,
      });

      if (__DEV__) {
        console.log('[Pay] Payment result:', result);
      }

      if (result.status === 'succeeded' || result.status === 'processing') {
        dispatch({ type: 'CONFIRM_SUCCESS' });
      } else {
        dispatch({ type: 'CONFIRM_ERROR', payload: 'Payment failed' });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Payment failed';
      dispatch({ type: 'CONFIRM_ERROR', payload: errorMessage });

      if (__DEV__) {
        console.error('[Pay] Payment error:', err);
      }
    }
  }, [state.paymentId, state.selectedOptionId, state.collectedData, evmWallet]);

  const retry = useCallback(() => {
    dispatch({ type: 'RETRY' });
  }, []);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const selectedOption = useMemo(
    () => state.options.find((opt) => opt.id === state.selectedOptionId),
    [state.options, state.selectedOptionId],
  );

  const requiresDataCollection = useMemo(
    () => Boolean(state.collectData && state.collectData.fields.length > 0),
    [state.collectData],
  );

  const progress = useMemo(() => {
    if (!requiresDataCollection) {
      return { current: 0, total: 0 };
    }

    const total = 4; // name + dob + pob + confirm
    let current = 0;

    switch (state.step) {
      case 'collect-name':
        current = 1;
        break;
      case 'collect-dob':
        current = 2;
        break;
      case 'collect-pob':
        current = 3;
        break;
      case 'confirm':
        current = 4;
        break;
    }

    return { current, total };
  }, [state.step, requiresDataCollection]);

  const canGoBack = [
    'collect-name',
    'collect-dob',
    'collect-pob',
    'confirm',
  ].includes(state.step);

  const showHeader = ![
    'initial-loading',
    'processing',
    'success',
    'error',
  ].includes(state.step);

  // Only show progress steps when data collection is required
  const showProgressSteps =
    requiresDataCollection &&
    ['collect-name', 'collect-dob', 'collect-pob', 'confirm'].includes(
      state.step,
    );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    state,
    actions: {
      goBack,
      startCollection,
      submitName,
      submitDob,
      submitPob,
      selectOption,
      confirm,
      retry,
    },
    computed: {
      selectedOption,
      requiresDataCollection,
      progress,
      canGoBack,
      showHeader,
      showProgressSteps,
    },
  };
}
