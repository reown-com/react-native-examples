import { useEffect, useCallback } from 'react';

import { walletKit, isPaymentLink } from '@/utils/WalletKitUtil';
import Sessions from '@/screens/Connections/components/Sessions';
import { HomeTabScreenProps } from '@/utils/TypesUtil';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { EIP155_CHAINS } from '@/constants/Eip155';

type Props = HomeTabScreenProps<'Connections'>;

export default function Connections({ route }: Props) {
  const handlePaymentLink = useCallback(async (paymentLink: string) => {
    const payClient = walletKit?.pay;
    console.log('[Pay] PayClient available:', !!payClient, payClient);
    if (!payClient) {
      console.error('[Pay] PayClient not initialized');
      ModalStore.open('LoadingModal', {
        errorMessage: 'Pay SDK not initialized. Please restart the app.',
      });
      return;
    }

    ModalStore.open('PaymentOptionsModal', {
      loadingMessage: 'Preparing your payment...',
    });

    try {
      const eip155Address = SettingsStore.state.eip155Address;

      const accounts = eip155Address
        ? Object.keys(EIP155_CHAINS).map(
            chainKey => `${chainKey}:${eip155Address}`,
          )
        : [];

      console.log('[Pay] Fetching payment options for:', paymentLink);
      console.log('[Pay] Accounts:', accounts);

      const paymentOptions = await payClient.getPaymentOptions({
        paymentLink,
        accounts,
        includePaymentInfo: true,
      });

      console.log('[Pay] Payment options received:', paymentOptions);

      ModalStore.open('PaymentOptionsModal', { paymentOptions });
    } catch (error: any) {
      console.error('[Pay] Error fetching payment options:', error);
      ModalStore.open('PaymentOptionsModal', {
        errorMessage: error?.message || 'Failed to fetch payment options',
      });
    }
  }, []);

  async function pair(uri: string) {
    ModalStore.open('LoadingModal', { loadingMessage: 'Pairing...' });
    await SettingsStore.state.initPromise;

    try {
      await walletKit.pair({ uri });
    } catch (error: any) {
      ModalStore.open('LoadingModal', {
        errorMessage: error?.message || 'There was an error pairing',
      });
    }
  }

  useEffect(() => {
    // URI received from QR code scanner
    if (route.params?.uri) {
      const uri = route.params.uri;
      if (isPaymentLink(uri)) {
        handlePaymentLink(uri);
      } else {
        pair(uri);
      }
    }
  }, [route.params?.uri, handlePaymentLink]);

  return <Sessions />;
}
