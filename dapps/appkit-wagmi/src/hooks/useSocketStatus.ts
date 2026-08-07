import SettingsStore from '@/stores/SettingsStore';
import {useEffect} from 'react';
import {useSnapshot} from 'valtio';
import {RELAYER_EVENTS} from '@walletconnect/core';
import { ToastUtils } from '@/utils/ToastUtils';
import { useProvider } from '@reown/appkit-react-native';

export function useSocketStatus() {
  const {provider} = useProvider();
  const {socketStatus} = useSnapshot(SettingsStore.state);

  useEffect(() => {
    if (provider?.client?.core) {
      provider?.client?.core.relayer.on(RELAYER_EVENTS.connect, () => {
        ToastUtils.showSuccessToast('Network connection is restored!');
        SettingsStore.setSocketStatus('connected');
      });
      provider?.client?.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        ToastUtils.showErrorToast('Network connection lost.', 'Please check your internet connection.');
        SettingsStore.setSocketStatus('disconnected');
      });
      provider?.client?.core.relayer.on(
        RELAYER_EVENTS.connection_stalled,
        () => {
          ToastUtils.showErrorToast('Network connection stalled.', 'Please check your internet connection.');
          SettingsStore.setSocketStatus('stalled');
        },
      );
      provider?.client?.core.relayer.on(
        RELAYER_EVENTS.transport_closed,
        () => {
          ToastUtils.showInfoToast('Network connection closed.');
          SettingsStore.setSocketStatus('closed');
        },
      );
    }
  }, [provider]);

  return socketStatus;
}
