import React, {useState} from 'react';

import NotifyClientContext, {
  NotificationsState,
  NotifyNotification,
} from '../context/NotifyClientContext';
import {NotifyClient} from '@walletconnect/notify-client';
import {useAccount} from 'wagmi';
import {Alert} from 'react-native';
import {ENV_PROJECT_ID} from '@env';
import cloneDeep from 'lodash.clonedeep';

export const NotifyClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {address} = useAccount();

  const [initializing, setInitializing] = React.useState(false);
  const [notifyClient, setNotifyClient] = React.useState<
    NotifyClient | undefined
  >(undefined);
  const [account, setAccount] = React.useState<string | undefined>(undefined);
  const [subscriptions, setSubscriptions] = React.useState<any>([]);
  const [notifications, setNotifications] = React.useState<NotificationsState>(
    {},
  );

  const initialized = !!notifyClient;

  React.useEffect(() => {
    if (address) {
      setAccount(prevAccount => {
        if (!prevAccount && address) {
          getActiveSubscriptions();
        }

        return `eip155:1:${address}`;
      });
    }
  }, [address]);

  React.useEffect(() => {
    if (!notifyClient) {
      console.log('notify client not initialized');
      return;
    }

    notifyClient.on('notify_subscription', async ({params, topic}) => {
      const {error} = params;

      if (error) {
        console.error('Setting up subscription failed: ', error);
      } else {
        // console.log('>>> notify_subscription', params);
        const allSubscriptions = params.allSubscriptions;
        const newSubscription = params.subscription;

        // console.log('>>> subscribed, updating list', params);
        if (!allSubscriptions) return;

        setSubscriptions(allSubscriptions);
        // New subscription was successfully created.
        // Inform the user and/or update app state to reflect the new subscription.
        console.log(`Subscribed successfully.`);
      }
    });

    notifyClient.on('notify_message', ({params, topic}) => {
      const {message} = params;
      const findSubsWithName = subscriptions.find(sub => sub?.topic === topic);
      console.log('Found subs: ', findSubsWithName);
      if (findSubsWithName) {
        console.log('Updating state');
        handleSetNotifications(findSubsWithName.topic, [message]);
      }
    });

    notifyClient.on('notify_update', ({params}) => {
      const {error} = params;

      if (error) {
        console.error('Setting up subscription failed: ', error);
      } else {
        console.log(`Successfully updated subscription scope.`);
      }
    });

    notifyClient.on('notify_subscriptions_changed', ({params}) => {
      const {subscriptions} = params;
      setSubscriptions(subscriptions);
    });
  }, [notifyClient]);

  async function getActiveSubscriptions() {
    if (!notifyClient) return;

    if (!account) {
      Alert.alert('Account not initialized yet');
      return;
    }

    const accountSubscriptions = notifyClient.getActiveSubscriptions({
      account,
    });

    const subs = Object.values(accountSubscriptions || {});

    if (subs.length === 0) return;

    setSubscriptions(subs);
  }

  async function handleInitializeNotifyClient() {
    setInitializing(true);

    try {
      const notifyClient = await NotifyClient.init({
        projectId: ENV_PROJECT_ID,
      });
      setNotifyClient(notifyClient);
      setInitializing(false);
    } catch (error) {
      console.log('>>> error initializing notify client', error);
      setInitializing(false);
    }
  }

  async function handleSetNotifications(
    topicId: string,
    incomingNotifications: NotifyNotification[],
  ) {
    if (!topicId) return;

    let notifsToReturn = {};
    setNotifications(prevNotifications => {
      const currentNotifications = prevNotifications[topicId] || [];
      const cloned = cloneDeep(currentNotifications);
      const newNotifications = incomingNotifications.filter(notification => {
        const isSeen = cloned.find(
          currentNotification => currentNotification.id === notification.id,
        );

        return !isSeen;
      });
      const updatedNotifications = [...cloned, ...newNotifications];

      const updated = {
        ...notifications,
        [topicId]: updatedNotifications,
      };
      notifsToReturn = updated;

      return updated;
    });

    return notifsToReturn;
  }

  React.useEffect(() => {
    if (!notifyClient || !account) {
      return;
    }

    getActiveSubscriptions();
  }, [notifyClient]);

  React.useEffect(() => {
    if (account && !initialized) {
      handleInitializeNotifyClient();
    }
    // throw 'Missing dependency: initialized';
  }, [account, initialized]);

  return (
    <NotifyClientContext.Provider
      value={{
        account,
        initializing,
        notifyClient,
        subscriptions,
        notifications,
        fetchSubscriptions: getActiveSubscriptions,
        setNotifications: handleSetNotifications,
        setInitializing,
        setSubscriptions,
        setNotifyClient,
      }}>
      {children}
    </NotifyClientContext.Provider>
  );
};
