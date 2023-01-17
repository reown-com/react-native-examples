import {EIP155_SIGNING_METHODS} from '../types/EIP155';
// import {signClient} from '@/components/WalletConnect/v2/SignClient';
import {SignClientTypes} from '@walletconnect/types';
import {useCallback, useEffect} from 'react';
import {SignClient} from '@walletconnect/sign-client/dist/types/client';

export default function useWalletConnectEventsManager(signClient: SignClient) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      console.log('SessionProposalMade', {proposal});
    },
    [],
  );

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      console.log('session_request', requestEvent);
      const {topic, params} = requestEvent;
      const {request} = params;
      const requestSession = signClient.session.get(topic);

      switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SIGN:
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
          return console.log('SessionSignModal', {
            requestEvent,
            requestSession,
          });

        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          return console.log('SessionSignTypedDataModal', {
            requestEvent,
            requestSession,
          });

        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          return console.log('SessionSendTransactionModal', {
            requestEvent,
            requestSession,
          });

        default:
          return console.log('SessionUnsuportedMethodModal', {
            requestEvent,
            requestSession,
          });
      }
    },
    [signClient.session],
  );

  /******************************************************************************
   * Set up WalletConnect event listeners
   *****************************************************************************/
  useEffect(() => {
    if (signClient) {
      signClient.on('session_proposal', onSessionProposal);
      signClient.on('session_request', onSessionRequest);
      // TODOs
      signClient.on('session_ping', data => console.log('ping', data));
      signClient.on('session_event', data => console.log('event', data));
      signClient.on('session_update', data => console.log('update', data));
      signClient.on('session_delete', data => console.log('delete', data));
    }
  }, [signClient, onSessionProposal, onSessionRequest]);
}
