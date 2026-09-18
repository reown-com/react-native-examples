/**
 * Pairing entry points, as plain module functions.
 *
 * These were the body of `usePairing`. They only ever touched module-level
 * singletons (walletKit, the valtio stores), never component state, so they
 * live here and the hook is a thin wrapper over them.
 *
 * Extracting them gives every URI ingress a single shared implementation: the
 * camera scanner, the test-mode paste field, deep links, NFC — and the dev
 * agent. That is what keeps the dev agent honest: it enters through the same
 * function the UI does rather than reaching past it into the stores.
 */
import { walletKit, isPaymentLink } from '@/utils/WalletKitUtil';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import PaymentStore from '@/store/PaymentStore';
import { EIP155_CHAINS } from '@/constants/Eip155';
import { SOLANA_CHAINS } from '@/constants/Solana';
import { TRON_MAINNET_CHAINS } from '@/constants/Tron';
import { ensureWalletReady } from '@/utils/WalletInitializationUtil';

export { isPaymentLink };

export async function handlePaymentLink(paymentLink: string) {
  PaymentStore.startPayment();
  ModalStore.open('PaymentOptionsModal');

  await SettingsStore.state.initPromise;

  const payClient = walletKit?.pay;
  if (!payClient) {
    PaymentStore.setError('Pay SDK not initialized. Please restart the app.');
    return;
  }

  try {
    // Payment options are account-specific. Restore the Pay-supported
    // namespaces before advertising accounts, rather than exposing an
    // address whose signer is not ready yet.
    const readiness = await Promise.allSettled([
      ensureWalletReady('eip155'),
      ensureWalletReady('solana'),
      ensureWalletReady('tron'),
    ]);
    if (readiness.every(result => result.status === 'rejected')) {
      throw new Error('No payment wallet could be initialized');
    }

    const eip155Address = SettingsStore.state.eip155Address;
    const solanaAddress = SettingsStore.state.solanaAddress;
    const tronAddress = SettingsStore.state.tronAddress;
    const accounts = [
      ...(eip155Address
        ? Object.keys(EIP155_CHAINS).map(
            chainKey => `${chainKey}:${eip155Address}`,
          )
        : []),
      ...(solanaAddress
        ? Object.keys(SOLANA_CHAINS).map(
            chainKey => `${chainKey}:${solanaAddress}`,
          )
        : []),
      ...(tronAddress
        ? Object.keys(TRON_MAINNET_CHAINS).map(
            chainKey => `${chainKey}:${tronAddress}`,
          )
        : []),
    ];

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

    PaymentStore.setPaymentOptions(paymentOptions);
  } catch (error: any) {
    PaymentStore.setError(error?.message || 'Failed to fetch payment options');
  }
}

export async function pair(uri: string) {
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
}

export async function handleUriOrPaymentLink(uri: string) {
  if (isPaymentLink(uri)) {
    await handlePaymentLink(uri);
  } else {
    await pair(uri);
  }
}
