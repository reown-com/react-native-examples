import React, {FC, ReactNode, useCallback, useEffect, useState} from 'react';

import NotifyClientContext, {
  NotificationsState,
  NotifyNotification,
} from '../context/NotifyClientContext';
import {NotifyClient} from '@walletconnect/notify-client';
import {useAccount} from 'wagmi';
import {Alert} from 'react-native';
import {ENV_PROJECT_ID} from '@env';
import cloneDeep from 'lodash.clonedeep';
import {init} from '@sentry/browser';
import {useNavigation} from '@react-navigation/native';
import {NotifyController} from '../controllers/NotifyController';
import {AccountController} from '../controllers/AccountController';
import {CaipAddress} from '@/utils/TypesUtil';

export const NotifyClientProvider: FC<{
  children: ReactNode;
}> = ({children}) => {
  const [account, setAccount] = useState<string>();
  const {reset} = useNavigation();

  useAccount({
    onConnect: ({address}) => {
      const _account: CaipAddress = `eip155:1:${address}`;
      setAccount(_account);
      initializeNotifyClient(_account);
      AccountController.setIsConnected(true);
      AccountController.setAddress(_account);
    },
    onDisconnect: () => {
      // Clear everything
      setAccount(undefined);
      reset({index: 0, routes: [{name: 'Connect'}]});
    },
  });

  // const [isRegistered, setIsRegistered] = useState(false);
  // const [initializing, setInitializing] = useState(false);
  const [notifyClient, setNotifyClient] = useState<NotifyClient>();
  const [subscriptions, setSubscriptions] = useState<any>([]);
  const [notifications, setNotifications] = useState<NotificationsState>({});

  // const initialized = !!notifyClient;

  // set listeners
  // useEffect(() => {
  //   if (!notifyClient) {
  //     console.log('notify client not initialized');
  //     return;
  //   }

  //   notifyClient.on('notify_subscription', async ({params, topic}) => {
  //     const {error} = params;
  //     console.log('notify_subscription', params, topic);

  //     if (error) {
  //       console.error('Setting up subscription failed: ', error);
  //     } else {
  //       if (account) {
  //         const _subs = notifyClient.getActiveSubscriptions({account});
  //         setSubscriptions(Object.values(_subs));
  //       }
  //     }
  //   });

  //   notifyClient.on('notify_message', ({params, topic}) => {
  //     const {message} = params;
  //     const findSubsWithName = subscriptions.find(sub => sub?.topic === topic);
  //     if (findSubsWithName) {
  //       handleSetNotifications(findSubsWithName.topic, [message]);
  //     }
  //   });

  //   notifyClient.on('notify_update', ({params}) => {
  //     const {error} = params;

  //     if (error) {
  //       console.error('Setting up subscription failed: ', error);
  //     } else {
  //       console.log('Successfully updated subscription scope.');
  //     }
  //   });

  //   notifyClient.on('notify_subscriptions_changed', ({params}) => {
  //     const {subscriptions: subs} = params;
  //     setSubscriptions(subs);
  //   });
  // }, [notifyClient]);

  // const getActiveSubscriptions = (
  //   _notifyClient: NotifyClient,
  //   _account: string,
  // ) => {
  //   if (!_notifyClient || !_account) {
  //     return;
  //   }

  //   const accountSubscriptions = _notifyClient.getActiveSubscriptions({
  //     account: _account,
  //   });

  //   const subs = Object.values(accountSubscriptions || {});

  //   if (subs.length === 0) {
  //     return;
  //   }

  //   console.log('accountSubscriptions', subs);
  //   setSubscriptions(subs);
  // };

  // async function handleSetNotifications(
  //   topicId: string,
  //   incomingNotifications: NotifyNotification[],
  // ) {
  //   if (!topicId) {
  //     return;
  //   }

  //   let notifsToReturn = {};
  //   setNotifications(prevNotifications => {
  //     const currentNotifications = prevNotifications[topicId] || [];
  //     const cloned = cloneDeep(currentNotifications);
  //     const newNotifications = incomingNotifications.filter(notification => {
  //       const isSeen = cloned.find(
  //         currentNotification => currentNotification.id === notification.id,
  //       );

  //       return !isSeen;
  //     });
  //     const updatedNotifications = [...cloned, ...newNotifications];

  //     const updated = {
  //       ...notifications,
  //       [topicId]: updatedNotifications,
  //     };
  //     notifsToReturn = updated;

  //     return updated;
  //   });

  //   return notifsToReturn;
  // }

  // const handleGetRegisterStatus = useCallback(async () => {
  //   if (!notifyClient || !account) {
  //     return;
  //   }

  //   const _isRegistered = notifyClient?.isRegistered({
  //     account,
  //     domain: '',
  //     allApps: true,
  //   });

  //   setIsRegistered(_isRegistered);
  // }, [account, notifyClient]);

  // useEffect(() => {
  //   if (!notifyClient || !account) {
  //     return;
  //   }

  //   getActiveSubscriptions();
  //   handleGetRegisterStatus();
  // }, [notifyClient, getActiveSubscriptions, account, handleGetRegisterStatus]);

  const initializeNotifyClient = async (_account: string) => {
    const _notifyClient = await NotifyClient.init({
      projectId: ENV_PROJECT_ID,
    });

    _notifyClient.on('notify_subscription', async ({params, topic}) => {
      console.log('notify_subscription', params, topic);
      AccountController.refreshSubscriptions();
    });

    _notifyClient.on('notify_message', ({params, topic}) => {
      console.log('notify_message', params, topic);
    });

    _notifyClient.on('notify_update', ({params}) => {
      console.log('notify_update', params);
    });

    _notifyClient.on('notify_subscriptions_changed', ({params}) => {
      console.log('notify_subscriptions_changed', params);
    });

    // setNotifyClient(_notifyClient);
    NotifyController.setClient(_notifyClient);
    AccountController.refreshSubscriptions();
    // getActiveSubscriptions(_notifyClient, _account);
  };

  return (
    <NotifyClientContext.Provider
      value={{
        account,
        // initializing,
        // isRegistered,
        // notifyClient,
        subscriptions,
        notifications,
        // fetchSubscriptions: getActiveSubscriptions,
        // setNotifications: handleSetNotifications,
        // setInitializing,
        setSubscriptions,
        setNotifyClient,
      }}>
      {children}
    </NotifyClientContext.Provider>
  );
};
