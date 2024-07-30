import SettingsStore from '@/stores/SettingsStore';
import {useEffect, useState} from 'react';
import Toast from 'react-native-toast-message';
import {useSnapshot} from 'valtio';
import {useAccount} from 'wagmi';
import {RELAYER_EVENTS} from '@walletconnect/core';

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
        Toast.show({
          type: 'success',
          text1: 'Network connection is restored!',
        });
        SettingsStore.setSocketStatus('connected');
      });
      provider.signer.client.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        Toast.show({
          type: 'error',
          text1: 'Network connection lost.',
        });
        SettingsStore.setSocketStatus('disconnected');
      });
      provider.signer.client.core.relayer.on(
        RELAYER_EVENTS.connection_stalled,
        () => {
          Toast.show({
            type: 'error',
            text1: 'Network connection stalled.',
          });
          SettingsStore.setSocketStatus('stalled');
        },
      );
      provider.signer.client.core.relayer.on(
        RELAYER_EVENTS.transport_closed,
        () => {
          Toast.show({
            type: 'info',
            text1: 'Network connection closed.',
          });
          SettingsStore.setSocketStatus('closed');
        },
      );
    }
  }, [provider]);

  return socketStatus;
}
