import { useCallback } from 'react';

import { walletKit, isPaymentLink } from '@/utils/WalletKitUtil';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { EIP155_CHAINS } from '@/constants/Eip155';

export { isPaymentLink };

export function usePairing() {
  const handlePaymentLink = useCallback(async (paymentLink: string) => {
    ModalStore.open('PaymentOptionsModal', {
      loadingMessage: 'Preparing your payment...',
    });
    await SettingsStore.state.initPromise;

    const payClient = walletKit?.pay;
    if (!payClient) {
      ModalStore.open('PaymentOptionsModal', {
        errorMessage: 'Pay SDK not initialized. Please restart the app.',
      });
      return;
    }

    try {
      const eip155Address = SettingsStore.state.eip155Address;
      const accounts = eip155Address
        ? Object.keys(EIP155_CHAINS).map(
            chainKey => `${chainKey}:${eip155Address}`,
          )
        : [];

      const paymentOptions = await payClient.getPaymentOptions({
        paymentLink,
        accounts,
        includePaymentInfo: true,
      });
      LogStore.log('paymentOptions', 'usePairing', 'handlePaymentLink', {
        paymentOptions: JSON.stringify(paymentOptions),
      });

      LogStore.log(
        'getPaymentOptions response',
        'usePairing',
        'handlePaymentLink',
        { paymentOptions },
      );

      ModalStore.open('PaymentOptionsModal', { paymentOptions });
    } catch (error: any) {
      ModalStore.open('PaymentOptionsModal', {
        errorMessage: error?.message || 'Failed to fetch payment options',
      });
    }
  }, []);

  const pair = useCallback(async (uri: string) => {
    ModalStore.open('LoadingModal', {
      loadingMessage: 'Preparing connection...',
    });
    await SettingsStore.state.initPromise;

    try {
      await walletKit.pair({ uri });
    } catch (error: any) {
      ModalStore.open('LoadingModal', {
        errorMessage: error?.message || 'There was an error pairing',
      });
    }
  }, []);

  const handleUriOrPaymentLink = useCallback(
    async (uri: string) => {
      if (isPaymentLink(uri)) {
        await handlePaymentLink(uri);
      } else {
        await pair(uri);
      }
    },
    [handlePaymentLink, pair],
  );

  return {
    pair,
    handlePaymentLink,
    handleUriOrPaymentLink,
    isPaymentLink,
  };
}
