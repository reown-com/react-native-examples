import type {NotifyClient} from '@walletconnect/notify-client';
import {proxy, ref} from 'valtio';

// -- Types --------------------------------------------- //
export interface NotifyControllerState {
  _client?: NotifyClient;
  initialized: boolean;
}

// -- State --------------------------------------------- //
const state = proxy<NotifyControllerState>({
  _client: undefined,
  initialized: false,
});

// -- Controller ---------------------------------------- //
export const NotifyController = {
  state,

  setClient(client: NotifyClient) {
    state._client = ref(client);
    state.initialized = true;
  },

  getClient() {
    return state._client;
  },
};
