import SettingsStore from '@/stores/SettingsStore';
import {useEffect, useState} from 'react';
import {useSnapshot} from 'valtio';
import {useAccount} from 'wagmi';
import {RELAYER_EVENTS} from '@walletconnect/core';
import { ToastUtils } from '@/utils/ToastUtils';

export function useSocketStatus() {
  const {connector} = useAccount();
  const [provider, setProvider] = useState<any>(null);
  const {socketStatus} = useSnapshot(SettingsStore.state);

  useEffect(() => {
    const getProvider = async () => {
      if (connector && connector?.getProvider) {
        const _provider = await connector?.getProvider();
        setProvider(_provider);
      }
    };

    getProvider();
  }, [connector]);

  useEffect(() => {
    if (provider?.signer?.client?.core) {
      provider?.signer?.client?.core.relayer.on(RELAYER_EVENTS.connect, () => {
        ToastUtils.showSuccessToast('Network connection is restored!');
        SettingsStore.setSocketStatus('connected');
      });
      provider.signer.client.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        ToastUtils.showErrorToast('Network connection lost.', 'Please check your internet connection.');
        SettingsStore.setSocketStatus('disconnected');
      });
      provider.signer.client.core.relayer.on(
        RELAYER_EVENTS.connection_stalled,
        () => {
          ToastUtils.showErrorToast('Network connection stalled.', 'Please check your internet connection.');
          SettingsStore.setSocketStatus('stalled');
        },
      );
      provider.signer.client.core.relayer.on(
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
