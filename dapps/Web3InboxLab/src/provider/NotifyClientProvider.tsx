import React, {useState} from 'react';

import NotifyClientContext from '../context/NotifyClientContext';
import {NotifyClient} from '@walletconnect/notify-client';
import {useAccount} from 'wagmi';
import {Alert} from 'react-native';

export const NotifyClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {address} = useAccount();

  const [notifyClient, setNotifyClient] = React.useState<
    NotifyClient | undefined
  >(undefined);
  const [account, setAccount] = React.useState<string | undefined>(undefined);
  const [subscriptions, setSubscriptions] = React.useState<any>([]);

  React.useEffect(() => {
    if (address) {
      setAccount(`eip155:1:${address}`);
    }
  }, [address]);

  React.useEffect(() => {
    if (!notifyClient) {
      console.log('notify client not initialized');
      return;
    }

    console.log('started listening events');
    // Handle response to a `notifyClient.subscribe(...)` call
    notifyClient.on('notify_subscription', async ({params}) => {
      const {error} = params;

      if (error) {
        // Setting up the subscription failed.
        // Inform the user of the error and/or clean up app state.
        console.error('Setting up subscription failed: ', error);
      } else {
        const allSubscriptions = params.allSubscriptions;
        const newSubscription = params.subscription;

        console.log('>>> subscribed, updating list', allSubscriptions?.length);
        if (!allSubscriptions) return;

        setSubscriptions(allSubscriptions);
        // New subscription was successfully created.
        // Inform the user and/or update app state to reflect the new subscription.
        // console.log(`Subscribed successfully.`, params);
      }
    });

    // Handle an incoming notification
    notifyClient.on('notify_message', ({params}) => {
      const {message} = params;
      console.log('Received notification: ', message);
      // e.g. build a notification using the metadata from `message` and show to the user.
    });

    // Handle response to a `notifyClient.update(...)` call
    notifyClient.on('notify_update', ({params}) => {
      const {error} = params;

      if (error) {
        // Updating the subscription's scope failed.
        // Inform the user of the error and/or clean up app state.
        console.error('Setting up subscription failed: ', error);
      } else {
        // Subscription's scope was updated successfully.
        // Inform the user and/or update app state to reflect the updated subscription.
        console.log(`Successfully updated subscription scope.`);
      }
    });

    // Handle a change in the existing subscriptions (e.g after a subscribe or update)
    notifyClient.on('notify_subscriptions_changed', ({params}) => {
      const {subscriptions} = params;
      // `subscriptions` will contain any *changed* subscriptions since the last time this event was emitted.
      // To get a full list of subscriptions for a given account you can use `notifyClient.getActiveSubscriptions({ account: 'eip155:1:0x63Be...' })`
    });
  }, [notifyClient]);

  async function getActiveSubscriptions(_account: string) {
    if (!notifyClient) return;

    const accountSubscriptions = notifyClient.getActiveSubscriptions({
      account: _account,
    });

    const subs = Object.values(accountSubscriptions || {});

    if (subs.length === 0) return;

    setSubscriptions(subs);
  }

  React.useEffect(() => {
    if (!notifyClient || !account) {
      return;
    }

    getActiveSubscriptions(account);
  }, [notifyClient]);

  return (
    <NotifyClientContext.Provider
      value={{
        account,
        notifyClient,
        subscriptions,
        fetchSubscriptions: getActiveSubscriptions,
        setSubscriptions,
        setNotifyClient,
      }}>
      {children}
    </NotifyClientContext.Provider>
  );
};
