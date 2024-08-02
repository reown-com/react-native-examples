import {useCallback, useEffect} from 'react';
import {Web3WalletTypes} from '@walletconnect/web3wallet';
import {SignClientTypes} from '@walletconnect/types';
import Toast from 'react-native-toast-message';

import {EIP155_CHAINS, EIP155_SIGNING_METHODS} from '@/utils/PresetsUtil';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import {web3wallet} from '@/utils/WalletConnectUtil';
import {getSupportedChains} from '@/utils/HelperUtil';

export default function useWalletConnectEventsManager(initialized: boolean) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
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
   * 2. Open Auth modal for confirmation / rejection
   *****************************************************************************/
  const onAuthRequest = useCallback((request: Web3WalletTypes.AuthRequest) => {
    ModalStore.open('AuthRequestModal', {request});
  }, []);

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      const {topic, params, verifyContext} = requestEvent;
      const {request} = params;
      const requestSession = web3wallet.engine.signClient.session.get(topic);
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
   * Set up WalletConnect event listeners
   *****************************************************************************/
  useEffect(() => {
    if (initialized) {
      //sign
      web3wallet.on('session_proposal', onSessionProposal);
      web3wallet.on('session_request', onSessionRequest);
      // auth
      web3wallet.on('auth_request', onAuthRequest);
      web3wallet.on('session_authenticate', onSessionAuthenticate);

      web3wallet.engine.signClient.events.on('session_ping', data => {
        console.log('session_ping received', data);
        Toast.show({
          type: 'info',
          text1: 'Session ping received',
        });
      });
      web3wallet.on('session_delete', data => {
        console.log('session_delete event received', data);
        SettingsStore.setSessions(
          Object.values(web3wallet.getActiveSessions()),
        );
      });
      // load sessions on init
      SettingsStore.setSessions(Object.values(web3wallet.getActiveSessions()));
    }
  }, [
    initialized,
    onAuthRequest,
    onSessionProposal,
    onSessionRequest,
    onSessionAuthenticate,
  ]);
}
