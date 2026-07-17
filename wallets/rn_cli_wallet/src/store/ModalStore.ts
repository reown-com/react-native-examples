import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { proxy, ref } from 'valtio';
import { haptics } from '@/utils/haptics';

/**
 * Types
 */
interface ModalData {
  proposal?: SignClientTypes.EventArguments['session_proposal'];
  requestEvent?: SignClientTypes.EventArguments['session_request'];
  requestSession?: SessionTypes.Struct;
  authRequest?: SignClientTypes.EventArguments['session_authenticate'];
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  session?: SessionTypes.Struct;
}

interface State {
  open: boolean;
  view?:
    | 'SessionProposalModal'
    | 'SessionRequestModal'
    | 'SessionUnsuportedMethodModal'
    | 'AuthRequestModal'
    | 'SessionAuthenticateModal'
    | 'LoadingModal'
    | 'SessionTonSendMessageModal'
    | 'SessionTonSignDataModal'
    | 'PaymentOptionsModal'
    | 'ImportWalletModal'
    | 'SessionDetailModal'
    | 'ScannerOptionsModal';
  data?: ModalData;
}

const disableHapticViews: State['view'][] = [
  'ImportWalletModal',
  'ScannerOptionsModal',
  'SessionDetailModal',
];

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

  open(view: State['view'], data?: State['data']) {
    if (!disableHapticViews.includes(view)) {
      haptics.modalOpen();
    }
    state.view = view;
    state.data = data ? ref(data) : undefined;
    state.open = true;
  },

  close() {
    state.open = false;
  },
};

export default ModalStore;
