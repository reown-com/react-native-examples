import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { proxy, ref } from 'valtio';
import type { PaymentOptionsResponse } from '@walletconnect/pay';

/**
 * Types
 */
interface ModalData {
  proposal?: SignClientTypes.EventArguments['session_proposal'];
  requestEvent?: SignClientTypes.EventArguments['session_request'];
  requestSession?: SessionTypes.Struct;
  authRequest?: SignClientTypes.EventArguments['session_authenticate'];
  loadingMessage?: string;
  errorMessage?: string;
  paymentOptions?: PaymentOptionsResponse;
  session?: SessionTypes.Struct;
}

interface State {
  open: boolean;
  view?:
    | 'SessionProposalModal'
    | 'SessionSignModal'
    | 'SessionSignTypedDataModal'
    | 'SessionSendTransactionModal'
    | 'SessionUnsuportedMethodModal'
    | 'AuthRequestModal'
    | 'SessionAuthenticateModal'
    | 'LoadingModal'
    | 'SessionSuiSignTransactionModal'
    | 'SessionSuiSignPersonalMessageModal'
    | 'SessionSuiSignAndExecuteTransactionModal'
    | 'SessionTonSendMessageModal'
    | 'SessionSignTronModal'
    | 'SessionTonSignDataModal'
    | 'PaymentOptionsModal'
    | 'ImportWalletModal'
    | 'SessionDetailModal'
    | 'ScannerOptionsModal'
  data?: ModalData;
}

/**
 * State
 */
const state = proxy<State>({
  open: false,
});

/**
 * Store / Actions
 */
const ModalStore = {
  state,

  open(view: State['view'], data: State['data']) {
    state.view = view;
    state.data = data ? ref(data) : undefined;
    state.open = true;
  },

  close() {
    state.open = false;
  },
};

export default ModalStore;
