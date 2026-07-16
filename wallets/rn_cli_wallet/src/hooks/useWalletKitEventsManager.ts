import { useCallback, useEffect } from 'react';
import { SignClientTypes } from '@walletconnect/types';
import { showToast } from '@/utils/ToastUtil';

import { formatJsonRpcError } from '@json-rpc-tools/utils';
import { getSdkError } from '@walletconnect/utils';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { getSupportedChains } from '@/utils/HelperUtil';
import { EIP155_CHAINS } from '@/constants/Eip155';
import { TON_SIGNING_METHODS } from '@/constants/Ton';
import { CANTON_SIGNING_METHODS } from '@/constants/Canton';
import { approveCantonRequest } from '@/utils/CantonRequestHandlerUtil';
import { getRequestConfig } from '@/modals/requestConfig';

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
        ModalStore.open('LoadingModal', {
          errorTitle: "These networks aren’t supported",
          errorMessage:
            'This wallet doesn’t support any of the networks this app requested. Try connecting to a different app.',
        });
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

      // Config-driven dispatch: methods are described in requestConfig.ts
      if (getRequestConfig(request.method)) {
        return ModalStore.open('SessionRequestModal', {
          requestEvent,
          requestSession,
        });
      }

      switch (request.method) {
        // Canton auto-approve (read-only methods)
        case CANTON_SIGNING_METHODS.LIST_ACCOUNTS:
        case CANTON_SIGNING_METHODS.GET_PRIMARY_ACCOUNT:
        case CANTON_SIGNING_METHODS.GET_ACTIVE_NETWORK:
        case CANTON_SIGNING_METHODS.STATUS:
        case CANTON_SIGNING_METHODS.LEDGER_API:
          try {
            const cantonResponse = await approveCantonRequest(requestEvent);
            return walletKit.respondSessionRequest({
              topic,
              response: cantonResponse,
            });
          } catch (e) {
            LogStore.error(
              (e as Error).message,
              'WalletKitEvents',
              'onSessionRequest:cantonAutoApprove',
            );
            showToast({
              type: 'error',
              text1: 'Canton request failed',
              text2: (e as Error).message,
            });
            return walletKit.respondSessionRequest({
              topic,
              response: formatJsonRpcError(
                requestEvent.id,
                getSdkError('INVALID_METHOD').message,
              ),
            });
          }
        // Custom TON modals (bespoke validation + rendering)
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
        chain => !!EIP155_CHAINS[chain],
      );

      if (chains.length === 0) {
        ModalStore.open('LoadingModal', {
          errorTitle: "These networks aren’t supported",
          errorMessage:
            'This wallet doesn’t support any of the networks this app requested. Try connecting to a different app.',
        });
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
        showToast({
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
