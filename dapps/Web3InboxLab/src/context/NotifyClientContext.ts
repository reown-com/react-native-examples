import {NotifyClient} from '@walletconnect/notify-client';
import React, {createContext} from 'react';

// Define the initial context value
interface NotifyClientContextValue {
  account: string | undefined;
  notifyClient: NotifyClient | undefined;
  subscriptions: Array<any>;
  fetchSubscriptions: () => Promise<void>;
  setSubscriptions: (subscriptions: string[]) => void;
  setNotifyClient: (notifyClient: NotifyClient) => void;
}

// Create the context
const NotifyClientContext = createContext<NotifyClientContextValue>({
  account: undefined,
  notifyClient: undefined,
  subscriptions: [],
  fetchSubscriptions: () => {},
  setSubscriptions: () => {},
  setNotifyClient: () => {},
});

export default NotifyClientContext;
