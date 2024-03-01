import {NotifyClient} from '@walletconnect/notify-client';
import {createContext} from 'react';

interface ProtocolOptions {
  protocol: string;
  data?: string;
}

interface Metadata {
  name: string;
  description: string;
  icons: string[];
  appDomain: string;
}

interface ImageUrls {
  sm: string;
  md: string;
  lg: string;
}

type ScopeMap = Record<
  string,
  {
    name: string;
    id: string;
    description: string;
    enabled: boolean;
    imageUrls: ImageUrls;
  }
>;

interface NotifySubscription {
  topic: string;
  account: string;
  relay: ProtocolOptions;
  appAuthenticationKey: string;
  metadata: Metadata;
  scope: ScopeMap;
  expiry: number;
  symKey: string;
}

export interface NotifyNotification {
  title: string;
  sentAt: number;
  body: string;
  id: string;
  url: string | null;
  type: string;
}

export type NotificationsState = {
  [topicId: string]: NotifyNotification[];
};

// Define the initial context value
interface NotifyClientContextValue {
  account: string | undefined;
  initializing: boolean;
  isRegistered: boolean;
  notifyClient: NotifyClient | undefined;
  subscriptions: Array<NotifySubscription>;
  notifications: NotificationsState;
  fetchSubscriptions: () => Promise<void>;
  setInitializing: (initializing: boolean) => void;
  setSubscriptions: (subscriptions: string[]) => void;
  setNotifications: (
    topicId: string,
    notifications: NotifyNotification[],
  ) => void;
  setNotifyClient: (notifyClient: NotifyClient) => void;
}

// Create the context
const NotifyClientContext = createContext<NotifyClientContextValue>({
  account: undefined,
  initializing: false,
  isRegistered: false,
  notifyClient: undefined,
  subscriptions: [],
  notifications: {},
  setInitializing: () => {},
  fetchSubscriptions: async () => {},
  setNotifications: () => {},
  setSubscriptions: () => {},
  setNotifyClient: () => {},
});

export default NotifyClientContext;
