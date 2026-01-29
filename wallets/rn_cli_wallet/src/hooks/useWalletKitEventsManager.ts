import { useCallback, useEffect } from 'react';
import { SignClientTypes } from '@walletconnect/types';
import Toast from 'react-native-toast-message';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { getSupportedChains } from '@/utils/HelperUtil';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { SUI_SIGNING_METHODS } from '@/constants/Sui';
import { TON_SIGNING_METHODS } from '@/constants/Ton';
import { TRON_SIGNING_METHODS } from '@/constants/Tron';

export default function useWalletKitEventsManager(initialized: boolean) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      LogStore.info(
        'Session proposal received',
        'WalletKitEvents',
        'onSessionProposal',
        {
          proposalId: proposal.id,
          proposer: proposal.params.proposer?.metadata?.name,
        },
      );
      // set the verify context so it can be displayed in the projectInfoCard
      SettingsStore.setCurrentRequestVerifyContext(proposal.verifyContext);

      const chains = getSupportedChains(
        proposal.params.requiredNamespaces,
        proposal.params.optionalNamespaces,
      );

      if (chains.length === 0) {
        ModalStore.open('LoadingModal', { errorMessage: 'Unsupported chains' });
      } else {
        ModalStore.open('SessionProposalModal', { proposal });
      }
    },
    [],
  );

  /******************************************************************************
   * 2. Open request handling modal based on method that was used
   *****************************************************************************/

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      LogStore.info(
        'Session request received',
        'WalletKitEvents',
        'onSessionRequest',
        {
          method: requestEvent.params.request.method,
          topic: requestEvent.topic,
        },
      );
      const { topic, params, verifyContext } = requestEvent;
      const { request } = params;
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
        case SUI_SIGNING_METHODS.SUI_SIGN_TRANSACTION:
          return ModalStore.open('SessionSuiSignTransactionModal', {
            requestEvent,
            requestSession,
          });
        case SUI_SIGNING_METHODS.SUI_SIGN_PERSONAL_MESSAGE:
          LogStore.log(
            'Opening Sui personal message modal',
            'WalletKitEvents',
            'onSessionRequest',
          );
          return ModalStore.open('SessionSuiSignPersonalMessageModal', {
            requestEvent,
            requestSession,
          });
        case SUI_SIGNING_METHODS.SUI_SIGN_AND_EXECUTE_TRANSACTION:
          return ModalStore.open('SessionSuiSignAndExecuteTransactionModal', {
            requestEvent,
            requestSession,
          });
        case TON_SIGNING_METHODS.SIGN_DATA:
          return ModalStore.open('SessionTonSignDataModal', {
            requestEvent,
            requestSession,
          });
        case TON_SIGNING_METHODS.SEND_MESSAGE:
          return ModalStore.open('SessionTonSendMessageModal', {
            requestEvent,
            requestSession,
          });
        case TRON_SIGNING_METHODS.TRON_SIGN_MESSAGE:
        case TRON_SIGNING_METHODS.TRON_SIGN_TRANSACTION:
        case TRON_SIGNING_METHODS.TRON_SEND_TRANSACTION:
          return ModalStore.open('SessionSignTronModal', {
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
      LogStore.info(
        'Session authenticate received',
        'WalletKitEvents',
        'onSessionAuthenticate',
        {
          id: authRequest.id,
          chains: authRequest.params.authPayload.chains,
        },
      );
      const chains = authRequest.params.authPayload.chains.filter(
        chain => !!EIP155_CHAINS[chain.split(':')[1]],
      );

      if (chains.length === 0) {
        ModalStore.open('LoadingModal', { errorMessage: 'Unsupported chains' });
      } else {
        ModalStore.open('SessionAuthenticateModal', { authRequest });
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
        LogStore.log(
          'Session ping received',
          'WalletKitEvents',
          'session_ping',
          { topic: data.topic },
        );
        Toast.show({
          type: 'info',
          text1: 'Session ping received',
        });
      });
      walletKit.on('session_delete', data => {
        LogStore.info('Session deleted', 'WalletKitEvents', 'session_delete', {
          topic: data.topic,
        });
        SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
      });
      // load sessions on init
      SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
    }
  }, [initialized, onSessionProposal, onSessionRequest, onSessionAuthenticate]);
}
