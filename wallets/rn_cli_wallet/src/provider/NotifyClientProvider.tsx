import React, {useEffect} from 'react';

import NotifyClientContext, {
  NotificationsState,
  NotifyNotification,
} from '../context/NotifyClientContext';
import {NotifyClient, NotifyClientTypes} from '@walletconnect/notify-client';
import {Alert} from 'react-native';
import {ENV_PROJECT_ID} from '@env';
import cloneDeep from 'lodash.clonedeep';
import {useSnapshot} from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SYM_KEY_PREFIX} from '@/constants/Storage';

export const NotifyClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {eip155Address: address} = useSnapshot(SettingsStore.state);

  const [isRegistered, setIsRegistered] = React.useState(false);
  const [initializing, setInitializing] = React.useState(false);
  const [notifyClient, setNotifyClient] = React.useState<
    NotifyClient | undefined
  >(undefined);
  const [account, setAccount] = React.useState<string | undefined>(undefined);
  const [subscriptions, setSubscriptions] = React.useState<any>([]);
  const [notifications, setNotifications] = React.useState<NotificationsState>(
    {},
  );

  function handleUpdateSymkeys(
    _subscriptions: NotifyClientTypes.NotifySubscription[],
  ) {
    _subscriptions.map(async ({topic, symKey}) => {
      const symkey = `${SYM_KEY_PREFIX}${topic}`;
      const existingSymKey = await AsyncStorage.getItem(symkey);

      if (!existingSymKey) {
        await AsyncStorage.setItem(symkey, symKey);
      }
    });
  }

  React.useEffect(() => {
    if (address) {
      setAccount(prevAccount => {
        if (!prevAccount && address) {
          getActiveSubscriptions();
        }

        return `eip155:1:${address}`;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  React.useEffect(() => {
    if (!notifyClient) {
      console.log('notify client not initialized');
      return;
    }

    handleUpdateSymkeys(notifyClient.subscriptions.getAll());

    notifyClient.on('notify_subscription', async ({params}) => {
      const {error} = params;

      if (error) {
        console.error('Setting up subscription failed: ', error);
      } else {
        const allSubscriptions = params.allSubscriptions;

        if (allSubscriptions) {
          setSubscriptions(allSubscriptions);
        }
      }
    });

    notifyClient.on('notify_message', ({params, topic}) => {
      const {message} = params;
      const findSubsWithName = subscriptions.find(sub => sub?.topic === topic);
      if (findSubsWithName) {
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
      handleUpdateSymkeys(subscriptions);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const notifyClient = await NotifyClient.init({projectId: ENV_PROJECT_ID});
      setNotifyClient(notifyClient);
      setInitializing(false);
    } catch (error) {
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

  async function handleGetRegisterStatus() {
    if (!notifyClient || !account) {
      return;
    }

    const isRegistered = notifyClient?.isRegistered({
      account,
      domain: '',
      allApps: true,
    });

    setIsRegistered(isRegistered);
  }

  React.useEffect(() => {
    if (!notifyClient || !account) {
      return;
    }

    getActiveSubscriptions();
    handleGetRegisterStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyClient, account]);

  return (
    <NotifyClientContext.Provider
      value={{
        account,
        initializing,
        isRegistered,
        notifyClient,
        subscriptions,
        notifications,
        initializeNotifyClient: handleInitializeNotifyClient,
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
