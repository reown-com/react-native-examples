// import {useCallback, useEffect, useState} from 'react';

// import type {NotifyClientTypes} from '@walletconnect/notify-client';
// import {noop} from 'rxjs';
// import useNotifyClient from './useNotifyClient';

// export const useWatchSubscriptions = () => {
//   const {account, notifyClient} = useNotifyClient();

//   const [activeSubscriptions, setActiveSubscriptions] = useState<
//     NotifyClientTypes.NotifySubscription[]
//   >([]);

//   const [registerMessage, setRegisterMessage] = useState<string | null>(null);
//   const [registeredKey, setRegistered] = useState<string | null>(null);

//   const [watchSubscriptionsComplete, setWatchSubscriptionsComplete] =
//     useState(false);

//   const updateSignatureModalState = useCallback(
//     ({message}: {message: string}) => {
//       setRegisterMessage(message);
//       setRegistered(null);
//     },
//     [],
//   );

//   const refreshNotifyState = useCallback(() => {
//     if (!notifyClient || !account) {
//       return;
//     }
//     const subs = notifyClient.getActiveSubscriptions({account});
//     setActiveSubscriptions(Object.values(subs));
//   }, [notifyClient, account]);

//   /*
//    * It takes time for handshake (watch subscriptions) to complete
//    * load in progress state using interval until it is
//    */
//   useEffect(() => {
//     if (watchSubscriptionsComplete) {
//       return noop;
//     }
//     // Account for sync init
//     const intervalId = setInterval(() => {
//       if (notifyClient?.hasFinishedInitialLoad()) {
//         setWatchSubscriptionsComplete(true);
//         return noop;
//       }
//       refreshNotifyState();
//     }, 100);

//     return () => clearInterval(intervalId);
//   }, [refreshNotifyState, watchSubscriptionsComplete]);

//   useEffect(() => {
//     if (!notifyClient) {
//       return noop;
//     }

//     const notifySignatureRequestedSub = notifyClient.observe(
//       'notify_signature_requested',
//       {
//         next: updateSignatureModalState,
//       },
//     );

//     const notifySignatureRequestCancelledSub = notifyClient.observe(
//       'notify_signature_request_cancelled',
//       {
//         next: () => setRegisterMessage(null),
//       },
//     );

//     const notifySubscriptionSub = notifyClient.observe('notify_subscription', {
//       next: refreshNotifyState,
//     });
//     const notifyDeleteSub = notifyClient.observe('notify_delete', {
//       next: refreshNotifyState,
//     });
//     const notifyUpdateSub = notifyClient.observe('notify_update', {
//       next: refreshNotifyState,
//     });

//     const notifySubsChanged = notifyClient.observe(
//       'notify_subscriptions_changed',
//       {
//         next: () => {
//           refreshNotifyState();
//           setWatchSubscriptionsComplete(true);
//         },
//       },
//     );

//     const notifyReregisterSub = notifyClient.observe('notify_reregister', {
//       next: params => {
//         handleRegistration(params.userPubkey).then(() => {
//           switch (params.nextAction.type) {
//             case 'subscribe':
//               notifyClient.subscribe(params.nextAction.params);
//               break;
//             case 'deleteSubscription':
//               notifyClient.deleteSubscription(params.nextAction.params);
//               break;
//             case 'update':
//               notifyClient.update(params.nextAction.params);
//               break;
//           }
//         });
//       },
//     });

//     const syncUpdateSub = notifyClient.observe('sync_update', {
//       next: refreshNotifyState,
//     });

//     return () => {
//       notifySubscriptionSub.unsubscribe();
//       syncUpdateSub.unsubscribe();
//       notifyUpdateSub.unsubscribe();
//       notifyDeleteSub.unsubscribe();
//       notifySubsChanged.unsubscribe();
//       notifySignatureRequestedSub.unsubscribe();
//       notifySignatureRequestCancelledSub.unsubscribe();
//       notifyReregisterSub.unsubscribe();
//     };
//   }, [notifyClient, refreshNotifyState, setWatchSubscriptionsComplete]);

//   return {
//     activeSubscriptions,
//     registeredKey,
//     registerMessage,
//     notifyClient,
//     refreshNotifyState,
//     watchSubscriptionsComplete,
//   };
// };
