import {useEffect, useState} from 'react';

import {web3wallet} from '@/utils/WalletConnectUtil';
import Sessions from '@/screens/Connections/components/Sessions';
import ActionButtons from '@/screens/Connections/components/ActionButtons';
import {CopyURIDialog} from '@/components/CopyURIDialog';
import {ConnectionsStackScreenProps} from '@/utils/TypesUtil';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';

type Props = ConnectionsStackScreenProps<'Connections'>;

export default function Connections({route}: Props) {
  const [copyDialogVisible, setCopyDialogVisible] = useState(false);

  const onDialogConnect = (uri: string) => {
    setCopyDialogVisible(false);
    setTimeout(() => {
      pair(uri);
    }, 1000);
  };

  const onDialogCancel = () => {
    setCopyDialogVisible(false);
  };

  async function pair(uri: string) {
    ModalStore.open('LoadingModal', {loadingMessage: 'Pairing...'});

    /**
     * Wait for settings web3wallet to be initialized before calling pair
     */
    await SettingsStore.state.initPromise;

    try {
      setCopyDialogVisible(false);
      SettingsStore.setCurrentRequestLinkMode(false);
      await web3wallet.pair({uri});
    } catch (error: any) {
      ModalStore.open('LoadingModal', {
        errorMessage: error?.message || 'There was an error pairing',
      });
    }
  }

  useEffect(() => {
    // URI received from QR code scanner
    if (route.params?.uri) {
      pair(route.params.uri);
    }
  }, [route.params?.uri]);

  return (
    <>
      <Sessions />
      <CopyURIDialog
        onConnect={onDialogConnect}
        onCancel={onDialogCancel}
        visible={copyDialogVisible}
      />
      <ActionButtons setCopyDialog={setCopyDialogVisible} />
    </>
  );
}
