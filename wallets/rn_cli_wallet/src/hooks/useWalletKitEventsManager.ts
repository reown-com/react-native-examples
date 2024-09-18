import {useCallback, useEffect} from 'react';
import {SignClientTypes} from '@walletconnect/types';
import Toast from 'react-native-toast-message';

import {EIP155_CHAINS, EIP155_SIGNING_METHODS} from '@/utils/PresetsUtil';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import {walletKit} from '@/utils/WalletKitUtil';
import {getSupportedChains} from '@/utils/HelperUtil';

export default function useWalletKitEventsManager(initialized: boolean) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      console.log('onSessionProposal', proposal);
      // set the verify context so it can be displayed in the projectInfoCard
      SettingsStore.setCurrentRequestVerifyContext(proposal.verifyContext);

      const chains = getSupportedChains(
        proposal.params.requiredNamespaces,
        proposal.params.optionalNamespaces,
      );

      if (chains.length === 0) {
        ModalStore.open('LoadingModal', {errorMessage: 'Unsupported chains'});
      } else {
        ModalStore.open('SessionProposalModal', {proposal});
      }
    },
    [],
  );

  /******************************************************************************
   * 2. Open request handling modal based on method that was used
   *****************************************************************************/

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      console.log('onSessionRequest', requestEvent);
      const {topic, params, verifyContext} = requestEvent;
      const {request} = params;
      const requestSession = walletKit.engine.signClient.session.get(topic);
      // set the verify context so it can be displayed in the projectInfoCard
      SettingsStore.setCurrentRequestVerifyContext(verifyContext);

      switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SIGN:
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
          return ModalStore.open('SessionSignModal', {
            requestEvent,
            requestSession,
          });

        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          return ModalStore.open('SessionSignTypedDataModal', {
            requestEvent,
            requestSession,
          });

        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          return ModalStore.open('SessionSendTransactionModal', {
            requestEvent,
            requestSession,
          });
        default:
          return ModalStore.open('SessionUnsuportedMethodModal', {
            requestEvent,
            requestSession,
          });
      }
    },
    [],
  );

  const onSessionAuthenticate = useCallback(
    (authRequest: SignClientTypes.EventArguments['session_authenticate']) => {
      console.log('onSessionAuthenticate', authRequest);
      const chains = authRequest.params.authPayload.chains.filter(
        chain => !!EIP155_CHAINS[chain.split(':')[1]],
      );

      if (chains.length === 0) {
        ModalStore.open('LoadingModal', {errorMessage: 'Unsupported chains'});
      } else {
        ModalStore.open('SessionAuthenticateModal', {authRequest});
      }
    },
    [],
  );

  /******************************************************************************
   * Set up WalletKit event listeners
   *****************************************************************************/
  useEffect(() => {
    if (initialized) {
      //sign
      walletKit.on('session_proposal', onSessionProposal);
      walletKit.on('session_request', onSessionRequest);
      // auth
      walletKit.on('session_authenticate', onSessionAuthenticate);

      walletKit.engine.signClient.events.on('session_ping', data => {
        console.log('session_ping received', data);
        Toast.show({
          type: 'info',
          text1: 'Session ping received',
        });
      });
      walletKit.on('session_delete', data => {
        console.log('session_delete event received', data);
        SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
      });
      // load sessions on init
      SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
    }
  }, [initialized, onSessionProposal, onSessionRequest, onSessionAuthenticate]);
}
