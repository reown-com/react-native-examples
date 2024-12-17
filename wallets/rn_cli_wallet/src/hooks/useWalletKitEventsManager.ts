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
      console.log('onSessionProposal', JSON.stringify(proposal, null, 2));
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
      console.log('request', JSON.stringify(requestEvent, null, 2));
      const requestSession = walletKit.engine.signClient.session.get(topic);
      console.log('requestSession', JSON.stringify(requestSession, null, 2));
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
    if (initialized && walletKit) {
      // ModalStore.open('SessionSendTransactionModal', {
      //   requestEvent: {
      //     id: 1734344941527167,
      //     topic:
      //       '3cb5a65c0c87fffa21b19a3772ca6117040c80c4f4bd0e729c417ad1d119ea48',
      //     params: {
      //       request: {
      //         method: 'eth_sendTransaction',
      //         params: [
      //           {
      //             data: '0xa9059cbb00000000000000000000000013a2ff792037aa2cd77fe1f4b522921ac59a9c5200000000000000000000000000000000000000000000000000000000001e8480',
      //             from: '0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //             to: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      //           },
      //         ],
      //         expiryTimestamp: 1734345241,
      //       },
      //       chainId: 'eip155:10',
      //     },
      //     verifyContext: {
      //       verified: {
      //         verifyUrl: 'https://verify.walletconnect.org',
      //         validation: 'VALID',
      //         origin: 'https://appkit-lab.reown.com',
      //         isScam: null,
      //       },
      //     },
      //   },
      //   requestSession: {
      //     relay: {
      //       protocol: 'irn',
      //     },
      //     namespaces: {
      //       eip155: {
      //         chains: [
      //           'eip155:1',
      //           'eip155:10',
      //           'eip155:137',
      //           'eip155:324',
      //           'eip155:42161',
      //           'eip155:8453',
      //           'eip155:100',
      //           'eip155:1313161554',
      //         ],
      //         methods: [
      //           'personal_sign',
      //           'eth_sign',
      //           'eth_signTransaction',
      //           'eth_signTypedData',
      //           'eth_signTypedData_v3',
      //           'eth_signTypedData_v4',
      //           'eth_sendRawTransaction',
      //           'eth_sendTransaction',
      //         ],
      //         events: ['accountsChanged', 'chainChanged'],
      //         accounts: [
      //           'eip155:1:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:10:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:137:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:324:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:42161:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:8453:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:100:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //           'eip155:1313161554:0x13A2Ff792037AA2cd77fE1f4B522921ac59a9C52',
      //         ],
      //       },
      //     },
      //     controller:
      //       'ea8f2172d22ace9801b2178a9f55b0053c9ac63d1f5a7d2bc4b79ec84d91244a',
      //     expiry: 1734080914,
      //     topic:
      //       'f013d8008bf88c77d78f64548f4103d6ec677254f8a9ba89366d5368a79334b0',
      //     requiredNamespaces: {},
      //     optionalNamespaces: {
      //       eip155: {
      //         methods: [
      //           'personal_sign',
      //           'eth_sign',
      //           'eth_signTransaction',
      //           'eth_signTypedData',
      //           'eth_signTypedData_v3',
      //           'eth_signTypedData_v4',
      //           'eth_sendRawTransaction',
      //           'eth_sendTransaction',
      //           'wallet_getCapabilities',
      //           'wallet_sendCalls',
      //           'wallet_showCallsStatus',
      //           'wallet_getCallsStatus',
      //           'wallet_grantPermissions',
      //           'wallet_revokePermissions',
      //           'wallet_switchEthereumChain',
      //         ],
      //         events: ['accountsChanged', 'chainChanged'],
      //         chains: [
      //           'eip155:1',
      //           'eip155:10',
      //           'eip155:137',
      //           'eip155:324',
      //           'eip155:42161',
      //           'eip155:8453',
      //           'eip155:84532',
      //           'eip155:1301',
      //           'eip155:11155111',
      //           'eip155:100',
      //           'eip155:295',
      //           'eip155:1313161554',
      //           'eip155:5000',
      //         ],
      //         rpcMap: {
      //           '1': 'https://rpc.walletconnect.org/v1/?chainId=eip155%3A1&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '10': 'https://rpc.walletconnect.org/v1/?chainId=eip155%3A10&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '100':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A100&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '137':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A137&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '295': 'https://mainnet.hashio.io/api',
      //           '324':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A324&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '1301':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A1301&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '5000':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A5000&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '8453':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A8453&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '42161':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A42161&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '84532':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A84532&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '11155111':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A11155111&projectId=702e2d45d9debca66795614cddb5c1ca',
      //           '1313161554':
      //             'https://rpc.walletconnect.org/v1/?chainId=eip155%3A1313161554&projectId=702e2d45d9debca66795614cddb5c1ca',
      //         },
      //       },
      //     },
      //     pairingTopic:
      //       'c0d67be3a41ded5ffa144e8ed6281a057e1e8e9f23003a427c1a70d04a5939f6',
      //     acknowledged: true,
      //     self: {
      //       publicKey:
      //         'ea8f2172d22ace9801b2178a9f55b0053c9ac63d1f5a7d2bc4b79ec84d91244a',
      //       metadata: {
      //         name: 'React Native Wallet Example',
      //         description: 'React Native WalletKit by Reown',
      //         url: 'https://reown.com/walletkit',
      //         icons: ['https://avatars.githubusercontent.com/u/179229932'],
      //         redirect: {
      //           native: 'rn-web3wallet://',
      //           universal: 'https://appkit-lab.reown.com/rn_walletkit',
      //           linkMode: true,
      //         },
      //       },
      //     },
      //     peer: {
      //       publicKey:
      //         '9dc9524bd9f09fb0e387729354099c686086757701e417815f73a168c4f31565',
      //       metadata: {
      //         name: 'AppKit Lab',
      //         description:
      //           'Explore the AppKit Lab to test the latest AppKit features.',
      //         url: 'https://appkit-lab.reown.com',
      //         icons: ['https://appkit-lab.reown.com/favicon.svg'],
      //       },
      //     },
      //     transportType: 'relay',
      //   },
      // });

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
