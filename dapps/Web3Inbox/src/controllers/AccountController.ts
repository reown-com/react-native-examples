import {CaipAddress} from '@/utils/TypesUtil';
import {proxy} from 'valtio';
import {NotifyController} from './NotifyController';

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean;
  isRegistered?: boolean; // check this
  address?: CaipAddress;
  subscriptions: any[];
  notifications: {[topic: string]: any[]};
}

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false,
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

  setAddress(address: AccountControllerState['address']) {
    state.address = address;
  },

  setNotifications(topic: string, notifications: any[], concat = false) {
    if (concat) {
      state.notifications[topic] =
        state.notifications[topic].concat(notifications);
    } else {
      state.notifications[topic] = notifications;
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
    state.address = undefined;
    state.subscriptions = [];
    state.notifications = {};
  },
};
