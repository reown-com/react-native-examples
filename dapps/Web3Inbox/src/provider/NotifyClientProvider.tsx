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

export const NotifyClientProvider: FC<{
  children: ReactNode;
}> = ({children}) => {
  const [account, setAccount] = useState<string>();
  const {reset} = useNavigation();

  useAccount({
    onConnect: ({address}) => {
      setAccount(`eip155:1:${address}`);
    },
    onDisconnect: () => {
      // Clear everything
      setAccount(undefined);
      reset({index: 0, routes: [{name: 'Connect'}]});
    },
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifyClient, setNotifyClient] = useState<NotifyClient>();
  const [subscriptions, setSubscriptions] = useState<any>([]);
  const [notifications, setNotifications] = useState<NotificationsState>({});

  // const initialized = !!notifyClient;

  // useEffect(() => {
  //   if (!notifyClient) {
  //     console.log('notify client not initialized');
  //     return;
  //   }

  //   notifyClient.on('notify_subscription', async ({params, topic}) => {
  //     const {error} = params;

  //     if (error) {
  //       console.error('Setting up subscription failed: ', error);
  //     } else {
  //       const allSubscriptions = params.allSubscriptions;

  //       if (!allSubscriptions) {
  //         return;
  //       }

  //       setSubscriptions(allSubscriptions);
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

  // const getActiveSubscriptions = useCallback(() => {
  //   if (!notifyClient) {
  //     return;
  //   }

  //   if (!account) {
  //     Alert.alert('Account not initialized yet');
  //     return;
  //   }

  //   const accountSubscriptions = notifyClient.getActiveSubscriptions({
  //     account,
  //   });

  //   const subs = Object.values(accountSubscriptions || {});

  //   if (subs.length === 0) {
  //     return;
  //   }

  //   setSubscriptions(subs);
  // }, [notifyClient, account]);

  // async function handleInitializeNotifyClient() {
  //   setInitializing(true);

  //   try {
  //     const _notifyClient = await NotifyClient.init({
  //       projectId: ENV_PROJECT_ID,
  //     });
  //     setNotifyClient(_notifyClient);
  //     setInitializing(false);
  //     setIsInitialized(true);
  //   } catch (error) {
  //     setInitializing(false);
  //   }
  // }

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

  // useEffect(() => {
  //   if (address) {
  //     setAccount(prevAccount => {
  //       if (!prevAccount && address) {
  //         getActiveSubscriptions();
  //       }

  //       return `eip155:1:${address}`;
  //     });
  //   }
  // }, [address, getActiveSubscriptions]);

  const initializeNotifyClient = useCallback(async () => {
    const _notifyClient = await NotifyClient.init({
      projectId: ENV_PROJECT_ID,
    });

    setNotifyClient(_notifyClient);
  }, []);

  useEffect(() => {
    // init notify
    if (!notifyClient) {
      initializeNotifyClient();
    }
  }, [notifyClient, initializeNotifyClient]);

  return (
    <NotifyClientContext.Provider
      value={{
        account,
        initializing,
        isRegistered,
        notifyClient,
        subscriptions,
        notifications,
        // fetchSubscriptions: getActiveSubscriptions,
        // setNotifications: handleSetNotifications,
        setInitializing,
        setSubscriptions,
        setNotifyClient,
      }}>
      {children}
    </NotifyClientContext.Provider>
  );
};
