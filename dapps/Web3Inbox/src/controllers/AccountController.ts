import {CaipAddress} from '@/utils/TypesUtil';
import {proxy} from 'valtio';
import {NotifyController} from './NotifyController';
import {NotifyClientTypes} from '@walletconnect/notify-client';

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean;
  isRegistered: boolean;
  address?: CaipAddress;
  subscriptions: NotifyClientTypes.NotifySubscription[];
  notifications: {[topic: string]: any[]};
}

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false,
  isRegistered: false,
  address: undefined,
  subscriptions: [],
  notifications: {},
});

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.isConnected = isConnected;
  },

  setIsRegistered(isRegistered: AccountControllerState['isRegistered']) {
    state.isRegistered = isRegistered;
  },

  setAddress(address: AccountControllerState['address']) {
    state.address = address;
  },

  setNotifications(topic: string, notifications: any[], override = true) {
    if (override) {
      state.notifications[topic] = notifications;
    } else {
      state.notifications[topic] =
        state.notifications[topic].concat(notifications);
    }
  },

  refreshSubscriptions() {
    if (!state.address) {
      return;
    }

    const subs = NotifyController.getClient()?.getActiveSubscriptions({
      account: state.address,
    });

    if (subs) {
      state.subscriptions = Object.values(subs);
    }
  },

  reset() {
    state.isConnected = false;
    state.isRegistered = false;
    state.address = undefined;
    state.subscriptions = [];
    state.notifications = {};
  },
};
