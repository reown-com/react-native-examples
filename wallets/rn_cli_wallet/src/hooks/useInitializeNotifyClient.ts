import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import SettingsStore from '@/store/SettingsStore';
import {useEffect} from 'react';
import {useSnapshot} from 'valtio';

export function useInitializeNotifyClient() {
  const {account, isRegistered, notifyClient, initializeNotifyClient} =
    useNotifyClientContext();
  const {wallet} = useSnapshot(SettingsStore.state);

  async function registerAccount() {
    if (!wallet) {
      return;
    }

    if (!notifyClient || !account) {
      return;
    }

    try {
      const {message, registerParams} = await notifyClient.prepareRegistration({
        account,
        domain: '',
        allApps: true,
      });

      const signature = await wallet.signMessage(message);

      await notifyClient.register({
        registerParams,
        signature,
      });
    } catch (error) {
      if (error?.message?.includes('user has an existing stale identity.')) {
        await notifyClient.unregister({account});
        registerAccount();
      }
    }
  }

  useEffect(() => {
    if (notifyClient && account && !isRegistered && wallet) {
      registerAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyClient, account, isRegistered, wallet]);

  useEffect(() => {
    initializeNotifyClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {isRegistered};
}
