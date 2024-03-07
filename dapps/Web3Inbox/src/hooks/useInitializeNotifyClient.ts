import {AccountController} from '@/controllers/AccountController';
import {NotifyController} from '@/controllers/NotifyController';
import {CaipAddress} from '@/utils/TypesUtil';
import {ENV_PROJECT_ID} from '@env';
import {useNavigation} from '@react-navigation/native';
import {NotifyClient} from '@walletconnect/notify-client';
import {useAccount} from 'wagmi';

export function useInitializeNotifyClient() {
  const {reset} = useNavigation();

  useAccount({
    onConnect: ({address}) => {
      const _account: CaipAddress = `eip155:1:${address}`;
      initializeNotifyClient(_account);
      AccountController.setIsConnected(true);
      AccountController.setAddress(_account);
    },
    onDisconnect: () => {
      console.log('onDisconnect');
      AccountController.reset();
      reset({index: 0, routes: [{name: 'Connect'}]});
    },
  });

  const initializeNotifyClient = async (_account: string) => {
    const _notifyClient = await NotifyClient.init({
      projectId: ENV_PROJECT_ID,
    });

    _notifyClient.on('notify_subscription', async ({params, topic}) => {
      console.log('notify_subscription', params, topic);
      AccountController.refreshSubscriptions();
    });

    _notifyClient.on('notify_message', ({params, topic}) => {
      const isSubscribed = AccountController.state.subscriptions.find(
        (sub: any) => sub.topic === topic,
      );

      if (isSubscribed) {
        const {message} = params;
        // @ts-ignore
        const notif = {...message, sentAt: message.sent_at};
        AccountController.setNotifications(topic, [notif], false);
      }
    });

    _notifyClient.on('notify_update', ({params}) => {
      console.log('notify_update', params);
      AccountController.refreshSubscriptions();
    });

    _notifyClient.on('notify_subscriptions_changed', ({params}) => {
      console.log('notify_subscriptions_changed', params);

      // TODO: check if this logic is correct or i should take new subs from params
      AccountController.refreshSubscriptions();
    });

    NotifyController.setClient(_notifyClient);
    AccountController.refreshSubscriptions();
  };
}
